import React, { useState, useEffect } from 'react';
import styles from './AccountSetting.module.css'

const AccountSetting = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage') || null);
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [bio, setBio] = useState(localStorage.getItem('bio') || '');
  const [password, setPassword] = useState('');

  const [chatAlert, setChatAlert] = useState(localStorage.getItem('chatAlert') === 'true');
  const [pushAlert, setPushAlert] = useState(localStorage.getItem('pushAlert') === 'true');
  const [highContrast, setHighContrast] = useState(localStorage.getItem('highContrast') === 'true');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      highContrast ? 'high-contrast' : 'light'
    );
  }, [highContrast]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem('profileImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem('email', email);
    localStorage.setItem('bio', bio);
    localStorage.setItem('chatAlert', chatAlert);
    localStorage.setItem('pushAlert', pushAlert);
    localStorage.setItem('highContrast', highContrast);
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
                <label className={styles.labelStyle}>비밀번호 변경</label><br />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={styles.inputStyle} />
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
