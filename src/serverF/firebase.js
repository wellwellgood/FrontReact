import admin from "firebase-admin";

const serviceAccount = {
  "type": "service_account",
  "project_id": "filefolder-54946",
  "private_key_id": "164aaa69170b3ac0f2885dfd427340c6213171b1",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEugIBADANBgkqhkiG9w0BAQEFAASCBKQwggSgAgEAAoIBAQCnpvQbARBXCDIH\n2hOwfvRTvNYzQ29tIoD8agIrYwecLOci+CedTQgiPGMQg37FzLPVh+MdmTyETwqr\n3yqTMnakT8TDEHFVsAIg1YbSpDL6//gDcPkf2AxUamFWRk3d1IBtNOCzF+EJodcr\nEGefx8UdbcCvdDj8r/KaQBStEdyfr8P+FNAAuk4rJA7+9IYyk6dw29fBE9YW+TrL\nDvPSFR7zILWh6yO72AAFF1lYLZIUabVTZcqD7sI/p+MaxRmzvbTStx9nj5eL7hyo\nz8XbPyzT+8GxS3Uge44FKt1CTQVMj4W2zv3ClJxhMHo6okrJLSrn9WjmwXEPJhsO\n/KyxPcDVAgMBAAECgf91ge1jiJcWAvVSen9BYKloTC8JrkL8Zhkka/XVDM/q0dKF\nHxTHNMftnYf0E64DSypaqtt8uNFlHmf+hv4DlHTYHIiAUqgub40wdlc0CJ5/xrZb\n92Q/bZ2/SPMBnyMn6Z9NlqjW3nblUfkxk838wQAbMXQ6lyIE6XAZAuJH46wMYguz\n9y3msSceLogN1knG/V/7i6H+nbzvhhWbZuw+lqO4UL1R06jVi5F5NYLJVq/MCFuQ\netNXVsDIJFoTnh3q3LcbkdjAxWLjkmfhNGL70sju+Ui+VWr99TEb7cBC8QkJaYdt\nIMozMnsxiE1rkBB+IRv2877OFb/vUTLhJZgYRNcCgYEA18N7/WLQqko4nRY1DDSY\n/hVQGI+f6SSrQGzPM6rZTseSqWjMdarksK/5YjSL2/HxKWgZ4X783IqxEcDoFFBv\n2sQ/I0pusV+rZby66S6QwknHo2sa/1ZBFMz4NajVzodWJDN+xHc7VIF2CPQ27/fG\nH47UIFICUxSX0MarbbWvf7cCgYEAxuqjKvpbajmo15Uv++XN1fVE3WHkKVFUp6uA\nSmILtUnRZhqKhY5BumeN15FSqYdcB4Y7U8FSZiERi14v3/U9QViViQppy7Fuwowx\nBCniiTpqBdpN58uYO0zCwxn5w0j8FL+U9+kpauOn8tc7oR+YZ+ckpVS9LyqKY997\n5RZ6a9MCgYBkkJav6Wi8lk+A2CLth25vrttgN0EfV5oCMzT4Lf+POnHfSBtUFMz2\nlW61GSy+3Su8UusNMTUGThZt4e3J2hvoaWPMPRsOzTqD9s1fdfa+t8i3IGq67Cb1\nXPurdwAAfQ/nW6EQTUp3/sdXMQySGHhdqSKx1ceDlauVAaRRREeCTQKBgBMRJrbV\n7LFP+ZlAmarhqktaCVHXMlGrlBvGWrPGliy4eLP601BeBHrjtjr1mSDa8r1d5o3u\nuAFGJjJfwuMK1OZQoXTTZLS7u0w2t/QYN7jDuqn49QLFB0CX6QtekAxiEJfEjXj+\nBpRSYiTq8LJPHwLGq0KVztSYlU9herTI5M81AoGAXpZwDC+O4ODaP4zhT9QrwNtf\n7vSmA5ztJR8CFlB1yHc390ZQiwO+iPrevNOjygvs7DBsKXsK331w7FAkYSy4O7LI\nsbdzwdBd04uTqqH7bdqU9yhrd3Db2X0KhEejlD/FhSWxGWO+YcMNSpJd+DW/ys2q\nJHG39ffnUpH8oUErkV8=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@filefolder-54946.iam.gserviceaccount.com",
  "client_id": "107853149465694705608",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc@filefolder-54946.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "filefolder-54946.appspot.com",
  });
}

const bucket = admin.storage().bucket();
export { bucket };
