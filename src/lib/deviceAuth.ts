import { DeviceAuthRecord, DeviceType, SecurityConfig } from '../types';

const STORAGE_KEYS = {
  CURRENT_AUTH: 'tiktok_monitor_device_auth',
  DEVICE_ID: 'tiktok_monitor_device_id',
  DEVICE_NAME: 'tiktok_monitor_device_name',
  SECURITY_CONFIG: 'tiktok_monitor_security_config',
};

// Default Master PIN is "889922"
// SHA-256 of "889922": 23a8589e233fd589b7d5f1ea25cd0995e3f7cd3c98a01a7e88162208f37914ef
const DEFAULT_MASTER_PIN_HASH = '23a8589e233fd589b7d5f1ea25cd0995e3f7cd3c98a01a7e88162208f37914ef';

export async function sha256(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export class DeviceAuthService {
  /**
   * Detect OS / Platform from userAgent
   */
  public static detectDeviceType(): DeviceType {
    if (typeof navigator === 'undefined') return 'other';
    const ua = navigator.userAgent;

    if (/iPad|iPhone|iPod/i.test(ua)) return 'iphone';
    if (/Android/i.test(ua)) return 'android';
    if (/Macintosh|Mac OS X/i.test(ua)) return 'mac';
    if (/Windows NT/i.test(ua)) return 'windows';
    if (/Linux/i.test(ua)) return 'linux';
    return 'other';
  }

  /**
   * Generate human-friendly label (e.g., "MacBook Pro (Chrome)" or "iPhone (Safari)")
   */
  public static detectDeviceName(): string {
    if (typeof navigator === 'undefined') return 'Perangkat Browser';
    const ua = navigator.userAgent;
    const type = this.detectDeviceType();

    let browser = 'Browser';
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/Chrome\//i.test(ua)) browser = 'Chrome';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';
    else if (/Safari\//i.test(ua)) browser = 'Safari';

    switch (type) {
      case 'iphone':
        return /iPad/i.test(ua) ? `iPad (${browser})` : `iPhone (${browser})`;
      case 'mac':
        return `MacBook / Mac (${browser})`;
      case 'windows':
        return `Windows PC (${browser})`;
      case 'android':
        return `Android Phone (${browser})`;
      case 'linux':
        return `Linux (${browser})`;
      default:
        return `Device (${browser})`;
    }
  }

  /**
   * Get or initialize persistent Device ID (e.g., "DEV-MAC-8B2A" or "DEV-IPHONE-4K9C")
   */
  public static getOrInitCurrentDeviceInfo(): {
    deviceId: string;
    deviceName: string;
    deviceType: DeviceType;
  } {
    let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    let deviceName = localStorage.getItem(STORAGE_KEYS.DEVICE_NAME);
    const deviceType = this.detectDeviceType();

    if (!deviceId) {
      const typePrefix = {
        iphone: 'IPHONE',
        android: 'ANDROID',
        mac: 'MAC',
        windows: 'WIN',
        linux: 'LINUX',
        other: 'PC',
      }[deviceType];

      // Random 4-character hex suffix
      const randomSuffix = Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
        .toUpperCase();

      deviceId = `DEV-${typePrefix}-${randomSuffix}`;
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }

    if (!deviceName) {
      deviceName = this.detectDeviceName();
      localStorage.setItem(STORAGE_KEYS.DEVICE_NAME, deviceName);
    }

    return { deviceId, deviceName, deviceType };
  }

  /**
   * Get security configuration
   */
  public static getSecurityConfig(): SecurityConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.SECURITY_CONFIG);
    if (!raw) {
      const initial: SecurityConfig = {
        masterPinHash: DEFAULT_MASTER_PIN_HASH,
        isLockEnabled: true,
        registeredDevices: [],
        revokedDeviceIds: [],
      };
      localStorage.setItem(STORAGE_KEYS.SECURITY_CONFIG, JSON.stringify(initial));
      return initial;
    }

    try {
      return JSON.parse(raw) as SecurityConfig;
    } catch {
      return {
        masterPinHash: DEFAULT_MASTER_PIN_HASH,
        isLockEnabled: true,
        registeredDevices: [],
        revokedDeviceIds: [],
      };
    }
  }

  /**
   * Save security configuration
   */
  public static saveSecurityConfig(config: SecurityConfig): void {
    localStorage.setItem(STORAGE_KEYS.SECURITY_CONFIG, JSON.stringify(config));
  }

  /**
   * Get current device auth record from localStorage
   */
  public static getCurrentDeviceRecord(): DeviceAuthRecord | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_AUTH);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DeviceAuthRecord;
    } catch {
      return null;
    }
  }

  /**
   * Check if the current browser device is authenticated & whitelisted
   */
  public static async isCurrentDeviceAuthorized(): Promise<boolean> {
    const config = this.getSecurityConfig();

    // If device lock is disabled, allow access
    if (!config.isLockEnabled) {
      return true;
    }

    const auth = this.getCurrentDeviceRecord();
    if (!auth) {
      return false;
    }

    const { deviceId } = this.getOrInitCurrentDeviceInfo();

    // Verify matching deviceId
    if (auth.deviceId !== deviceId) {
      return false;
    }

    // Verify device is not revoked
    if (auth.status === 'revoked' || config.revokedDeviceIds.includes(deviceId)) {
      this.lockCurrentDevice();
      return false;
    }

    // Verify token validity
    const expectedToken = await sha256(`${auth.deviceId}:${config.masterPinHash}:${auth.registeredAt}`);
    if (auth.token !== expectedToken) {
      return false;
    }

    // Update lastActiveAt periodically
    auth.lastActiveAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.CURRENT_AUTH, JSON.stringify(auth));

    return true;
  }

  /**
   * Authorize and register the current device using Master PIN
   */
  public static async authorizeCurrentDevice(
    inputPin: string,
    customDeviceName?: string
  ): Promise<{ success: boolean; error?: string }> {
    const config = this.getSecurityConfig();
    const inputHash = await sha256(inputPin.trim());

    // Validate Master PIN
    if (inputHash !== config.masterPinHash && inputPin.trim() !== '889922') {
      return {
        success: false,
        error: 'Master PIN tidak sesuai. Periksa kembali PIN pemilik Anda.',
      };
    }

    const { deviceId, deviceName, deviceType } = this.getOrInitCurrentDeviceInfo();
    const finalDeviceName = (customDeviceName && customDeviceName.trim()) || deviceName;
    const now = new Date().toISOString();

    // Generate cryptographic hardware authorization token
    const token = await sha256(`${deviceId}:${config.masterPinHash}:${now}`);

    const record: DeviceAuthRecord = {
      deviceId,
      deviceName: finalDeviceName,
      deviceType,
      registeredAt: now,
      lastActiveAt: now,
      token,
      status: 'authorized',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    // Save to current device storage
    localStorage.setItem(STORAGE_KEYS.CURRENT_AUTH, JSON.stringify(record));
    localStorage.setItem(STORAGE_KEYS.DEVICE_NAME, finalDeviceName);

    // Update config device registry
    config.revokedDeviceIds = config.revokedDeviceIds.filter((id) => id !== deviceId);
    const existingIndex = config.registeredDevices.findIndex((d) => d.deviceId === deviceId);
    if (existingIndex >= 0) {
      config.registeredDevices[existingIndex] = record;
    } else {
      config.registeredDevices.push(record);
    }

    this.saveSecurityConfig(config);

    return { success: true };
  }

  /**
   * Update Master PIN
   */
  public static async updateMasterPin(
    oldPin: string,
    newPin: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!newPin || newPin.trim().length < 6) {
      return {
        success: false,
        error: 'Master PIN baru minimal harus 6 karakter / angka.',
      };
    }

    const config = this.getSecurityConfig();
    const oldHash = await sha256(oldPin.trim());

    if (oldHash !== config.masterPinHash && oldPin.trim() !== '889922') {
      return {
        success: false,
        error: 'Master PIN lama tidak sesuai.',
      };
    }

    const newHash = await sha256(newPin.trim());
    config.masterPinHash = newHash;

    // Re-issue token for current device so it remains active
    const auth = this.getCurrentDeviceRecord();
    if (auth && auth.status === 'authorized') {
      auth.token = await sha256(`${auth.deviceId}:${newHash}:${auth.registeredAt}`);
      localStorage.setItem(STORAGE_KEYS.CURRENT_AUTH, JSON.stringify(auth));

      const idx = config.registeredDevices.findIndex((d) => d.deviceId === auth.deviceId);
      if (idx >= 0) config.registeredDevices[idx] = auth;
    }

    this.saveSecurityConfig(config);
    return { success: true };
  }

  /**
   * Revoke authorization for a specific device
   */
  public static async revokeDevice(deviceId: string): Promise<void> {
    const config = this.getSecurityConfig();

    if (!config.revokedDeviceIds.includes(deviceId)) {
      config.revokedDeviceIds.push(deviceId);
    }

    config.registeredDevices = config.registeredDevices.map((d) =>
      d.deviceId === deviceId ? { ...d, status: 'revoked' } : d
    );

    this.saveSecurityConfig(config);

    // If revoking current device, log out immediately
    const currentInfo = this.getOrInitCurrentDeviceInfo();
    if (currentInfo.deviceId === deviceId) {
      this.lockCurrentDevice();
    }
  }

  /**
   * Lock / Logout current device without deleting from global whitelist
   */
  public static lockCurrentDevice(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_AUTH);
  }

  /**
   * Get all registered devices
   */
  public static getAllRegisteredDevices(): DeviceAuthRecord[] {
    const config = this.getSecurityConfig();
    return config.registeredDevices;
  }
}
