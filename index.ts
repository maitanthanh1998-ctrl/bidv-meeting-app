export interface Staff {
  staff_code: string;
  name: string;
  title: string;
  email: string;
}

export interface Meeting {
  id: string;
  start_time: string;
  end_time: string;
  room: 'large' | 'small';
  content: string;
  staff_code: string;
  team: string;
  meeting_password: string;
  created_at: string;
  updated_at: string;
  staff?: Staff;
}

export interface UserSession {
  id: string;
  rememberMe: boolean;
  timestamp: string;
}

export type TeamType = 
  | 'Squad1' | 'Squad2' | 'Squad3' | 'Squad4' 
  | 'Squad5' | 'Squad6' | 'Squad7' | 'Squad8' 
  | 'BanQLDA' | 'KyThuat';

export type RoomType = 'large' | 'small';

export interface CreateMeetingProps {
  onBack: () => void;
  onSubmit: (meetingData: any) => void;
  usedPasswords: Set<string>;
}
