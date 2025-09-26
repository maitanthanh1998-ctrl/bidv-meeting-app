import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import SplashScreen from '../src/components/SplashScreen';
import LoginScreen from '../src/components/LoginScreen';
import MainMenu from '../src/components/MainMenu';
import CreateMeeting from '../src/components/CreateMeeting';
import CurrentMeetings from '../src/components/CurrentMeetings';
import PastMeetings from '../src/components/PastMeetings';
import { getAuthSession } from '../src/utils/auth';
import { STORAGE_KEYS } from '../src/utils/storageKeys';

type AppState = 'splash' | 'login' | 'menu' | 'create' | 'current' | 'past';

export default function Index() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [meetings, setMeetings] = useState<any[]>([]);
  const [pastMeetings, setPastMeetings] = useState<any[]>([]);
  const [usedPasswords, setUsedPasswords] = useState<Set<string>>(new Set());
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Refs để tránh persist không cần thiết
  const lastSavedMeetingsRef = useRef<string | null>(null);
  const lastSavedPastRef = useRef<string | null>(null);
  
  useEffect(() => {
  checkAuthSession();
    // Load persisted meetings (web localStorage)
     (async () => {
      try {
        const raw = await import('../src/utils/storage');
        const { getItem } = raw;
        // Load meetings with merge to prevent data loss
        const saved = await getItem(STORAGE_KEYS.MEETINGS);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setMeetings(prev => {
                // Merge by ID, prioritize existing (newer) data
                const existingIds = prev.map(m => m.id);
                const newMeetings = parsed.filter(m => !existingIds.includes(m.id));
                console.log('Merging meetings - existing:', prev.length, 'new from storage:', newMeetings.length);
                return [...prev, ...newMeetings];
              });
            }
          } catch (error) {
            console.error('Failed to parse meetings from storage:', error);
          }
        }
        
        // Load past meetings with merge
        const savedPast = await getItem(STORAGE_KEYS.PAST_MEETINGS);
        if (savedPast) {
          try {
            const parsedPast = JSON.parse(savedPast);
            if (Array.isArray(parsedPast)) {
              console.log('Loading past meetings from localStorage:', parsedPast);
              setPastMeetings(prev => {
                const existingIds = prev.map(m => m.id);
                const newPast = parsedPast.filter(m => !existingIds.includes(m.id));
                return [...prev, ...newPast];
              });
            }
          } catch (error) {
            console.error('Failed to parse past meetings from storage:', error);
          }
        } else {
          console.log('No past meetings found in localStorage');
        }
        setIsDataLoaded(true);
      } catch {
        setIsDataLoaded(true);
      }
    })();
  }, []);
 
  const checkAuthSession = async () => {
    const session = await getAuthSession();
    if (session && session.rememberMe) {
      // Skip login if user chose to remember
      setTimeout(() => setAppState('menu'), 2000);
    }
  };

  useEffect(() => {
    // Persist meetings on change (web localStorage)
    if (!isDataLoaded) return; // Don't save during initial load
    
    const meetingsJson = JSON.stringify(meetings);
    if (meetingsJson === lastSavedMeetingsRef.current) return; // No actual changes
    
    (async () => {
      try {
        const raw = await import('../src/utils/storage');
        const { setItem } = raw;
        console.log('Persisting meetings to storage');
        await setItem(STORAGE_KEYS.MEETINGS, meetingsJson);
        lastSavedMeetingsRef.current = meetingsJson;
      } catch {}
    })();
  }, [meetings, isDataLoaded]);

  useEffect(() => {
    // Persist past meetings on change (web localStorage)
    if (!isDataLoaded) return; // Don't save during initial load
    
    const pastJson = JSON.stringify(pastMeetings);
    if (pastJson === lastSavedPastRef.current) return; // No actual changes
    
    (async () => {
      try {
        const raw = await import('../src/utils/storage');
        const { setItem } = raw;
        console.log('Persisting past meetings to storage:', pastMeetings.length, 'items');
        await setItem(STORAGE_KEYS.PAST_MEETINGS, pastJson);
        lastSavedPastRef.current = pastJson;
      } catch {}
    })();
  }, [pastMeetings, isDataLoaded]);

  // Derive usedPasswords từ active meetings - không cần persist riêng
  useEffect(() => {
    const now = new Date();
    const activePasswords = new Set(
      meetings
        .filter(meeting => {
          const endTime = new Date(meeting.end_time);
          return endTime >= now && meeting.meeting_password;
        })
        .map(meeting => meeting.meeting_password)
    );
    console.log('Derived active passwords:', activePasswords.size);
    setUsedPasswords(activePasswords);
  }, [meetings]);

  // Tự động trả lại mật khẩu cho các cuộc họp đã hết hạn - chỉ chạy 1 lần khi data loaded
  useEffect(() => {
    if (!isDataLoaded) return;

    const checkExpiredMeetings = () => {
      const now = new Date();
      
      setMeetings(prevMeetings => {
        const expiredMeetings = prevMeetings.filter(meeting => {
          const endTime = new Date(meeting.end_time);
          return endTime < now;
        });

        if (expiredMeetings.length > 0) {
          console.log('Found expired meetings:', expiredMeetings.length);
          
          // usedPasswords sẽ tự update qua useEffect derive từ meetings

          // Thêm các cuộc họp đã hết hạn vào pastMeetings với trạng thái "Đã họp"
          setPastMeetings(prevPast => {
            // Tránh duplicate - chỉ thêm những meeting chưa có trong pastMeetings
            const existingIds = prevPast.map(m => m.id);
            const newExpiredMeetings = expiredMeetings.filter(meeting => 
              !existingIds.includes(meeting.id)
            );
            
            if (newExpiredMeetings.length === 0) return prevPast;
            
            return [
              ...prevPast,
              ...newExpiredMeetings.map(meeting => ({
                ...meeting,
                status: 'completed', // Đã họp
                moved_to_past_at: new Date().toISOString()
              }))
            ];
          });

          // Return filtered meetings (remove expired ones)
          return prevMeetings.filter(meeting => {
            const endTime = new Date(meeting.end_time);
            return endTime >= now;
          });
        }
        
        return prevMeetings; // No expired meetings, return unchanged
      });
    };

    // Chỉ chạy 1 lần khi data loaded và sau đó mỗi phút
    checkExpiredMeetings();
    const interval = setInterval(checkExpiredMeetings, 60000);

    return () => clearInterval(interval);
  }, [isDataLoaded]); // Chỉ depend vào isDataLoaded, không depend vào meetings

  const handleSplashFinish = () => {
    // Skip login on startup for shared user mode
    setAppState('menu');
  };

  const handleLogin = () => {
    setAppState('menu');
  };

  const handleNavigation = (screen: string) => {
    setAppState(screen as AppState);
  };

  const handleLogout = () => {
    // In shared user mode, return to menu instead of login
    setAppState('menu');
  };

  const handleMeetingSubmit = (meetingData: any) => {
    setMeetings(prev => [...prev, meetingData]);
    // Thêm mật khẩu vào danh sách đã sử dụng
    if (meetingData.meeting_password) {
      setUsedPasswords(prev => new Set(prev).add(meetingData.meeting_password));
    }
  };

  const handleUpdateMeeting = (id: string, updatedData: any) => {
    setMeetings(prev => prev.map(meeting => 
      meeting.id === id ? { ...meeting, ...updatedData } : meeting
    ));
  };

  const handleDeleteMeeting = (id: string) => {
    // usedPasswords sẽ tự update khi meetings thay đổi
    const meetingToDelete = meetings.find(meeting => meeting.id === id);

    // Thêm cuộc họp đã xóa vào pastMeetings với trạng thái "Đã được xóa"
    if (meetingToDelete) {
      setPastMeetings(prev => {
        // Tránh duplicate - chỉ thêm nếu chưa có trong pastMeetings
        const existingIds = prev.map(m => m.id);
        if (existingIds.includes(meetingToDelete.id)) return prev;
        
        return [
          ...prev,
          {
            ...meetingToDelete,
            status: 'deleted', // Lịch họp đã được xóa
            moved_to_past_at: new Date().toISOString()
          }
        ];
      });
    }

    setMeetings(prev => prev.filter(meeting => meeting.id !== id));
  };

  const handleBack = () => {
    setAppState('menu');
  };

  const renderCurrentScreen = () => {
    switch (appState) {
      case 'splash':
        return <SplashScreen onFinish={handleSplashFinish} />;
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'menu':
        return <MainMenu onNavigate={handleNavigation} onLogout={handleLogout} />;
      case 'create':
        return <CreateMeeting onBack={handleBack} onSubmit={handleMeetingSubmit} usedPasswords={usedPasswords} />;
      case 'current':
        return (
          <CurrentMeetings 
            onBack={handleBack} 
            meetings={meetings}
            onUpdateMeeting={handleUpdateMeeting}
            onDeleteMeeting={handleDeleteMeeting}
          />
        );
      case 'past':
        return (
          <PastMeetings 
            onBack={handleBack} 
            meetings={pastMeetings}
          />
        );
      default:
        return <MainMenu onNavigate={handleNavigation} onLogout={handleLogout} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});