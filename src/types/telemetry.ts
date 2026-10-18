export type ScreenType = 
  | 'overview' 
  | 'live-dashboard' 
  | 'session-history-and-analytics' 
  | 'fleet-manager' 
  | 'alert-overlay-preview' 
  | 'system-settings';

export type SimState = 'safe' | 'drowsy' | 'danger';

export interface DriverNode {
  id: string;
  name: string;
  truckId: string;
  truckModel: string;
  avatarUrl: string;
  route: string;
  status: 'critical' | 'elevated' | 'nominal';
  cognitiveIndex: number; // 0 - 100
  ear: number; // e.g. 0.34
  perclos: number; // e.g. 4.2%
  blinkRate: number; // /min
  alertTimeAgo?: string;
  shiftDuration: string;
  headPose: {
    pitch: number;
    yaw: number;
    roll: number;
  };
}

export interface IncidentEvent {
  id: string;
  type: 'MICRO-SLEEP' | 'GAZE DEVIATION' | 'SENSOR CLEARED' | 'HOS COMPLIANCE' | 'SHIFT HANDOFF';
  severity: 'critical' | 'warning' | 'info';
  driverName: string;
  timeAgo: string;
  details: string;
  truckMeta: string;
  actionText?: string;
}

export interface HaulLogSession {
  id: string;
  date: string;
  timeRange: string;
  routeFrom: string;
  routeTo: string;
  truckUnit: string;
  truckModel: string;
  duration: string;
  avgDrowsiness: number;
  maxDrowsiness: number;
  criticalAlerts: number;
  minorAlerts: number;
  cognitiveStrain: 'High' | 'Med' | 'Low';
  riskBadge: 'CRITICAL INTERVENTION' | 'ELEVATED' | 'LOW RISK';
}

export interface CalibrationConfig {
  earThreshold: number; // default 0.22
  durationLimit: number; // default 1.8s
  yawnLimit: number; // default 3
  droopAngle: number; // default 15
  cameraStream: string;
  nightIrMode: 'AUTO' | 'ALWAYS';
  inferenceFps: 30 | 60;
  alarmTone: 'dual_tone' | 'pulse_chime' | 'haptic_voice';
  masterVolumeDb: number; // default 88
  dispatchSyncEnabled: boolean;
  sosContactName: string;
  sosEmergencyLine: string;
}
