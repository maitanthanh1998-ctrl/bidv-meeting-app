# BIDV Meeting Scheduler 

🏢 **Ứng dụng quản lý lịch họp cho BIDV**

## ✨ Tính năng

- 📅 **Đặt lịch họp** với thông tin chi tiết
- 👥 **Chọn Team** (Squad 1-8, Ban QLDA)  
- 🔐 **Mật khẩu tự động** (00-99) cho bảo mật
- 📊 **Lịch sử quá khứ** với trạng thái rõ ràng
- 🌐 **Multi-user** - Đồng bộ real-time qua cloud
- 💾 **Persistent storage** - Không mất data khi reload

## 🚀 Deploy Instructions

Xem file [`DEPLOY.md`](./DEPLOY.md) để biết chi tiết cách deploy lên Netlify.

## 🛠 Tech Stack

- **Frontend**: React Native Web (Expo)
- **Backend**: Netlify Functions  
- **Storage**: JSONBin.io + localStorage fallback
- **UI**: Custom components with responsive design

## 📱 Screenshots

- Đặt lịch họp với team selection
- Màn hình thành công với cảnh báo chụp ảnh
- Lịch họp hiện tại theo ngày
- Lịch sử quá khứ với trạng thái

## 🔒 Security Features  

- Mật khẩu meeting tự động random
- Yêu cầu mật khẩu để sửa/xóa
- Organization-level data isolation
- Secure cloud storage with fallback

---

*Developed for BIDV with ❤️*
