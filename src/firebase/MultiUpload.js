// MultiUpload.js
import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "./firebase";

const MultiUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (files.length === 0) return alert("파일을 선택하세요");
    setUploading(true);

    for (const file of files) {
      const uniqueName = `${Date.now()}-${file.name}`;
      const fileRef = ref(storage, `uploads/${uniqueName}`);

      try {
        await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(fileRef);

        // Firestore에 메타데이터 저장
        await addDoc(collection(db, "files"), {
          name: file.name,
          url: downloadUrl,
          uploadedAt: serverTimestamp(),
        });

        console.log(`✅ ${file.name} 업로드 완료`);
      } catch (err) {
        console.error(`❌ ${file.name} 업로드 실패:`, err);
      }
    }

    setUploading(false);
    alert("모든 파일 업로드 완료");
  };

//   return (
//     <div>
//       <h3>📤 다중 파일 업로드</h3>
//       <input type="file" multiple onChange={(e) => setFiles([...e.target.files])} />
//       <button onClick={handleUpload} disabled={uploading}>
//         {uploading ? "업로드 중..." : "업로드"}
//       </button>
//     </div>
//   );
};

export default MultiUpload;
