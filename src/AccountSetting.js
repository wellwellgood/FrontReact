import React, { useState, useEffect } from 'react';
import styles from './AccountSetting.module.css'

const AccountSetting = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');

  // const userKey = localStorage.getItem('username') || 'defaultUser';
  const [profileImage, setProfileImage] = useState(localStorage.getItem(`profileImage_${userKey}`) || null);
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [bio, setBio] = useState(localStorage.getItem('bio') || '');
  const [password, setPassword] = useState('');

  const [chatAlert, setChatAlert] = useState(localStorage.getItem('chatAlert') === 'true');
  const [pushAlert, setPushAlert] = useState(localStorage.getItem('pushAlert') === 'true');
  const [highContrast, setHighContrast] = useState(localStorage.getItem('highContrast') === 'true');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const userKey = sessionStorage.getItem('username') || localStorage.getItem('username') || 'defaultUser';

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      highContrast ? 'high-contrast' : 'light'
    );
  }, [highContrast]);

  
  useEffect(() => {
      const userKey = localStorage.getItem('username') || 'defaultUser';
      const handleStorageClear = (e) => {
        if (e.key === `profileImage_${userKey}`) {
          const clearedImage = localStorage.getItem(`profileImage_${userKey}`);
          setProfileImage(clearedImage || null);
        }
      };
      window.addEventListener('storage', handleStorageClear);
      return () => window.removeEventListener('storage', handleStorageClear);
    }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      const userKey = localStorage.getItem('username') || 'defaultUser';
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          if(img.width < 100 || img.height < 100) {
            alert('이미지 크기는 100px X 100px 이하로 설정해 주세요')
            return;
          }
        }
        setProfileImage(reader.result);
  
        // ✅ 미리 저장해서 실시간 반영 가능
        localStorage.setItem(`profileImage_${userKey}`, reader.result);
        sessionStorage.setItem(`profileImage_${userKey}`, reader.result);
  
        // ✅ storage 이벤트 강제로 발생시켜서 Search에 즉시 전달
        window.dispatchEvent(new StorageEvent('storage', {
          key: `profileImage_${userKey}`,
          newValue: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = () => {
    const userKey = localStorage.getItem('username') || 'defaultUser';
    localStorage.setItem('email', email);
    localStorage.setItem('bio', bio);
    localStorage.setItem('chatAlert', chatAlert);
    localStorage.setItem('pushAlert', pushAlert);
    localStorage.setItem('highContrast', highContrast);
  
    // ✅ 최종 저장 시 profileImage도 다시 동기화
    localStorage.setItem(`profileImage_${userKey}`, profileImage);
    sessionStorage.setItem(`profileImage_${userKey}`, profileImage);
    alert('설정이 저장되었습니다.');
  };
  

  return (
    <div className={styles.containerStyle}>
      <div className={styles.headerStyle}>
        <h3>설정</h3>
        <button onClick={onClose}>❌ 닫기</button>
      </div>

      <div className={styles.contentStyle}>
        <nav className={styles.navStyle}>
          <button onClick={() => setActiveTab('profile')}>📷 <p>프로필</p></button><br />
          <button onClick={() => setActiveTab('notifications')}>🔔 <p>알림</p></button><br />
          <button onClick={() => setActiveTab('general')}>⚙️ <p>일반</p></button>
        </nav>

        <main className={styles.mainStyle}>
          {activeTab === 'profile' && (
            <>
              <div className={styles.sectionStyle}>
                <label className={styles.labelStyle}>프로필 이미지</label><br />
                {profileImage && <img src={profileImage} alt="preview" />}
                <input type="file" onChange={handleImageChange} />
              </div>

              <div className={styles.sectionStyle}>
                <label className={styles.labelStyle}>아이디 (수정 불가)</label><br />
                <input type="text" value={username} disabled/>
              </div>

              <div className={styles.sectionStyle}>
                <label className={styles.labelStyle}>이메일</label><br />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={styles.inputStyle} />
              </div>

              <div className={styles.sectionStyle}>
                <label className={styles.labelStyle}>자기소개</label><br />
                <textarea value={bio} onChange={e => setBio(e.target.value)} className={styles.inputStyle} rows={4} />
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              <div className={styles.sectionStyle}>
                <label><input type="checkbox" checked={chatAlert} onChange={() => setChatAlert(!chatAlert)} /> 채팅 알림</label>
              </div>
              <div className={styles.sectionStyle}>
                <label><input type="checkbox" checked={pushAlert} onChange={() => setPushAlert(!pushAlert)} /> 푸시 알림</label>
              </div>
            </>
          )}

          {activeTab === 'general' && (
            <>
              <div className={styles.sectionStyle}>
                <label><input type="checkbox" checked={highContrast} onChange={() => setHighContrast(!highContrast)} /> 고대비 모드</label>
              </div>
            </>
          )}

          <div className={styles.buttonContainerStyle}>
            <button onClick={handleSave} className={styles.buttonStyle}>설정 저장</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AccountSetting;
