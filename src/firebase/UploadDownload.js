import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import axios from "axios";

const handleMultiUpload = async (files, messageText, receiver) => {
  const sender = sessionStorage.getItem("username"); // 로그인한 사용자

  for (const file of files) {
    try {
      const uniqueName = `${Date.now()}-${file.name}`;
      const fileRef = ref(storage, `chat/${uniqueName}`);

      // Firebase Storage에 업로드
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      // 서버에 메타데이터 저장
      await axios.post("/api/messages", {
        sender_username: sender,
        receiver_username: receiver.username,
        message: messageText,
        file_name: file.name,
        fileurl: fileUrl,
        filesize: file.size,
      });

      console.log(`✅ ${file.name} 업로드 완료`);
    } catch (err) {
      console.error(`❌ ${file.name} 업로드 실패`, err);
    }
  }

  alert("모든 파일 업로드 완료");

  return (
    <input
        type="file"
        multiple
        onChange={(e) => handleMultiUpload(e.target.files, "파일 전송합니다", selectedUser)}
    />
  )
};
