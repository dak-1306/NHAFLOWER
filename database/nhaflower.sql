-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th8 01, 2025 lúc 08:57 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `nhaflower`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `admin`
--

CREATE TABLE `admin` (
  `id_admin` int(11) NOT NULL,
  `id_taikhoan` int(11) NOT NULL,
  `ho_ten` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `admin`
--

INSERT INTO `admin` (`id_admin`, `id_taikhoan`, `ho_ten`) VALUES
(1, 3, 'Lê Văn Quản Trị');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietdonhang`
--

CREATE TABLE `chitietdonhang` (
  `id_donhang` int(11) NOT NULL,
  `id_sanpham` int(11) NOT NULL,
  `so_luong` int(11) NOT NULL,
  `don_gia` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `chitietdonhang`
--

INSERT INTO `chitietdonhang` (`id_donhang`, `id_sanpham`, `so_luong`, `don_gia`) VALUES
(1, 1, 1, 250000.00),
(2, 2, 2, 150000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `danhgia`
--

CREATE TABLE `danhgia` (
  `id_danhgia` int(11) NOT NULL,
  `id_khachhang` int(11) DEFAULT NULL,
  `id_sanpham` int(11) DEFAULT NULL,
  `sao` tinyint(4) DEFAULT NULL CHECK (`sao` between 1 and 5),
  `noi_dung` text DEFAULT NULL,
  `ngay_danhgia` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `danhgia`
--

INSERT INTO `danhgia` (`id_danhgia`, `id_khachhang`, `id_sanpham`, `sao`, `noi_dung`, `ngay_danhgia`) VALUES
(1, 1, 1, 5, 'Hoa rất đẹp, giao đúng giờ!', '2025-07-22 15:00:00'),
(2, 2, 2, 4, 'Tươi và thơm, rất hài lòng.', '2025-07-23 16:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `donhang`
--

CREATE TABLE `donhang` (
  `id_donhang` int(11) NOT NULL,
  `id_khachhang` int(11) NOT NULL,
  `ngay_dat` datetime DEFAULT NULL,
  `dia_chi_giao` text DEFAULT NULL,
  `trang_thai` enum('cho','dang_giao','hoan_tat') DEFAULT 'cho'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `donhang`
--

INSERT INTO `donhang` (`id_donhang`, `id_khachhang`, `ngay_dat`, `dia_chi_giao`, `trang_thai`) VALUES
(1, 1, '2025-07-22 10:00:00', '123 Lê Lợi, Quận 1', 'dang_giao'),
(2, 2, '2025-07-23 14:00:00', '456 Cách Mạng, Quận 3', '');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `khachhang`
--

CREATE TABLE `khachhang` (
  `id_khachhang` int(11) NOT NULL,
  `id_taikhoan` int(11) NOT NULL,
  `ten` varchar(100) NOT NULL,
  `sdt` varchar(15) DEFAULT NULL,
  `dia_chi` text DEFAULT NULL,
  `ngay_sinh` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `khachhang`
--

INSERT INTO `khachhang` (`id_khachhang`, `id_taikhoan`, `ten`, `sdt`, `dia_chi`, `ngay_sinh`) VALUES
(1, 1, 'Nguyễn Văn A', '0909123456', '123 Lê Lợi, Quận 1', '1995-01-15'),
(2, 2, 'Trần Thị B', '0911222333', '456 Cách Mạng, Quận 3', '1998-06-20'),
(5, 3, 'Nguyễn Văn B', '0987654321', '123 Đường ABC, TP.HCM', NULL),
(14, 17, 'Nguyễn Văn Băng', '08394006581', 'HCM', NULL),
(16, 20, 'Trần Văn B', '0919315800', 'HCM', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `khuyenmai`
--

CREATE TABLE `khuyenmai` (
  `id_khuyenmai` int(11) NOT NULL,
  `ten_km` varchar(100) DEFAULT NULL,
  `phan_tram` int(11) DEFAULT NULL CHECK (`phan_tram` between 0 and 100),
  `ngay_batdau` date DEFAULT NULL,
  `ngay_kt` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `khuyenmai`
--

INSERT INTO `khuyenmai` (`id_khuyenmai`, `ten_km`, `phan_tram`, `ngay_batdau`, `ngay_kt`) VALUES
(1, 'Ưu đãi cho dịp lễ tình nhân', 20, '2025-02-10', '2025-02-15'),
(2, 'Giảm giá mùa hè', 15, '2025-06-01', '2025-06-30');


-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `loaihoa`
--

CREATE TABLE `loaihoa` (
  `id_loaihoa` int(11) NOT NULL,
  `ten_loai` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `loaihoa`
--

INSERT INTO `loaihoa` (`id_loaihoa`, `ten_loai`) VALUES
(1, 'Hoa Hồng'),
(2, 'Hoa Cúc'),
(3, 'Hoa Lan'),
(4, 'Hoa Ly'),
(5, 'Hoa Tulip'),
(6, 'Hoa Cẩm Chướng'),
(7, 'Hoa Huớng Dương');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sanpham`
--

CREATE TABLE `sanpham` (
  `id_sanpham` int(11) NOT NULL,
  `ten_hoa` varchar(100) NOT NULL,
  `gia` decimal(10,2) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `so_luong` int(11) DEFAULT NULL,
  `id_loaihoa` int(11) NOT NULL,
  `id_khuyenmai` int(11) DEFAULT NULL,
  `hinh_anh` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `sanpham`
--

INSERT INTO `sanpham` (`id_sanpham`, `ten_hoa`, `gia`, `mo_ta`, `so_luong`, `id_loaihoa`, `id_khuyenmai`, `hinh_anh`) VALUES
(1, 'Hoa Hồng Đỏ', 250000.00, 'Bó hoa hồng đỏ tươi đẹp', 10, 1, 1, 'hoa_hong_do.jpg'),
(2, 'Hoa Cúc Trắng', 150000.00, 'Hoa cúc trắng tinh khôi', 20, 2, NULL, 'hoa_cuc_trang.jpg'),
(3, 'Hoa Lily Vàng', 180000, 'Bó hoa lily vàng sang trọng', 15, 1, NULL, 'lily_vang.jpg'),
(4, 'Hoa Cẩm Chướng', 120000, 'Hoa cẩm chướng nhiều màu sắc', 25, 2, 2, 'cam_chuong.jpg'),
(5, 'Hoa Hướng Dương', 160000, 'Hoa hướng dương tươi sáng', 30, 1, 1, 'huong_duong.jpg'),
(6, 'Hoa Lan Hồ Điệp', 350000, 'Chậu lan hồ điệp sang trọng', 8, 3, NULL, 'lan_ho_diep.jpg'),
(7, 'Hoa Baby Trắng', 90000, 'Bó baby trắng nhẹ nhàng', 40, 2, NULL, 'baby_trang.jpg'),
(8, 'Hoa Hồng Đỏ', 150000, 'Bó hoa hồng đỏ truyền thống', 20, 1, 1, 'hong_do.jpg'),
(9, 'Hoa Hồng Trắng', 145000, 'Hoa hồng trắng tinh khiết', 18, 1, NULL, 'hong_trang.jpg'),
(10, 'Hoa Hồng Vàng', 155000, 'Hoa hồng vàng rực rỡ', 22, 1, 2, 'hong_vang.jpg'),
(11, 'Hoa Cúc Họa Mi', 100000, 'Cúc họa mi nhẹ nhàng tinh tế', 35, 2, NULL, 'cuc_hoa_mi.jpg'),
(12, 'Hoa Cúc Vàng', 95000, 'Cúc vàng rực rỡ cho mọi dịp', 28, 2, 1, 'cuc_vang.jpg'),
(13, 'Hoa Cẩm Tú Cầu', 170000, 'Bó hoa cẩm tú cầu thanh lịch', 14, 3, NULL, 'cam_tu_cau.jpg'),
(14, 'Hoa Hồng Kem', 160000, 'Hoa hồng màu kem ngọt ngào', 16, 1, NULL, 'hong_kem.jpg'),
(15, 'Hoa Mẫu Đơn', 250000, 'Hoa mẫu đơn sang trọng quý phái', 10, 3, 1, 'mau_don.jpg'),
(16, 'Hoa Tulip Đỏ', 200000, 'Bó tulip đỏ Hà Lan', 12, 1, NULL, 'tulip_do.jpg'),
(17, 'Hoa Tulip Vàng', 200000, 'Bó tulip vàng ngọt ngào', 13, 1, NULL, 'tulip_vang.jpg'),
(18, 'Hoa Đồng Tiền', 120000, 'Đồng tiền nhiều màu sắc', 25, 2, NULL, 'dong_tien.jpg'),
(19, 'Hoa Baby Hồng', 95000, 'Bó baby hồng dễ thương', 30, 2, NULL, 'baby_hong.jpg'),
(20, 'Hoa Cát Tường', 130000, 'Hoa cát tường mềm mại và thanh lịch', 20, 3, 2, 'cat_tuong.jpg'),
(21, 'Hoa Ly Hồng', 190000, 'Hoa ly màu hồng quyến rũ', 12, 1, 1, 'ly_hong.jpg'),
(22, 'Hoa Hồng Xanh', 175000, 'Bó hoa hồng xanh độc đáo', 8, 1, NULL, 'hong_xanh.jpg'),
(23, 'Hoa Cẩm Chướng Trắng', 125000, 'Hoa cẩm chướng trắng thanh nhã', 18, 2, 1, 'cam_chuong_trang.jpg'),
(24, 'Hoa Lan Vàng', 280000, 'Lan vàng sang trọng', 9, 3, NULL, 'lan_vang.jpg'),
(25, 'Hoa Mẫu Đơn Trắng', 260000, 'Mẫu đơn trắng nhẹ nhàng', 10, 3, 1, 'mau_don_trang.jpg'),
(26, 'Hoa Cẩm Tú Cầu Hồng', 175000, 'Cẩm tú cầu hồng lãng mạn', 13, 3, 2, 'cam_tu_cau_hong.jpg'),
(27, 'Hoa Lan Trắng', 300000, 'Lan trắng tinh khôi', 7, 3, NULL, 'lan_trang.jpg');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `taikhoan`
--

CREATE TABLE `taikhoan` (
  `id_taikhoan` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `vai_tro` enum('khach','admin') NOT NULL,
  `trang_thai` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `taikhoan`
--

INSERT INTO `taikhoan` (`id_taikhoan`, `email`, `mat_khau`, `vai_tro`, `trang_thai`) VALUES
(1, 'nhakh1@example.com', 'hashed_password1', 'khach', 1),
(2, 'nhakh2@example.com', 'hashed_password2', 'khach', 1),
(3, 'admin1@example.com', 'hashed_password3', 'admin', 1),
(10, 'testuser@example.com', '$2y$10$2q7Ul3os97OrFbliX0sRhO2CjE81WyVsNltnwIIV5dzOYNLon.DNm', 'khach', 1),
(11, 'khach1@test.com', '$2y$10$gQhWIiKmFn79HZQInhwQRuLvgYaGsTsrIm8n17irpDdgsdJGwdJ2i', 'khach', 1),
(12, 'khach2@test.com', '$2y$10$jHkRQ6Vto8mDrJURhJywYuQr9NG6xJh7xts.Zax9dJG0J2cgFLuVm', 'khach', 1),
(13, 'khach3@test.com', '$2y$10$xhxdkGqg979MHVef5BUOUe8HYfgP0o0ovjX2DwFJlsWyp9fQO/36S', 'khach', 1),
(14, 'testuser1753978651@example.com', '$2y$10$Xyihs3EoUiZxzhpp906QkeAvs3ja8t8qD33.5/m7nBKUVpQoq2q7G', 'khach', 1),
(15, 'manual_test_1753978992@example.com', '$2y$10$QYSUEa18betlvVYT.MxW5.ChhVZpyHlUEpTAM/kHLyc.SyupqJ1.m', 'khach', 1),
(16, 'quicktest_1753979195@example.com', '$2y$10$q44MS80NiM9D.O7rOmpdz.FnIAZ7URa0but4.sNmOlakKo78pm35O', 'khach', 1),
(17, 'dang1306@gmail.com', '$2y$10$FsOPOdY7Mp651KstcTln9OZk.RnpGtgEtMTRAMb2.oUBrooJe/EVC', 'khach', 1),
(18, 'dang1336@gmail.com', '$2y$10$fRN7XPcoRC8M2n2UwNnsHuTiD4Sjzv3VkIK0zSyJ7GyhIBBCNvT.u', 'khach', 1),
(19, 'test@test.com', '$2y$10$VH0Jc/ORK93pD3IwjgxXpePnzBN63KZWNBIfx0iP1jxmoBNx/iCjq', 'khach', 1),
(20, 'thd123@gmail.com', '$2y$10$x6QiPVHIWhrsJrU/V6mcvOscfmB1KuwH7mKJCV9Q69Sc/0I2.wiAe', 'khach', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thongbao`
--

CREATE TABLE `thongbao` (
  `id_thongbao` int(11) NOT NULL,
  `id_admin` int(11) DEFAULT NULL,
  `tieu_de` varchar(200) DEFAULT NULL,
  `noi_dung` text DEFAULT NULL,
  `ngay_gui` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `thongbao`
--

INSERT INTO `thongbao` (`id_thongbao`, `id_admin`, `tieu_de`, `noi_dung`, `ngay_gui`) VALUES
(1, 1, 'Khuyến mãi Valentine!', 'Giảm giá 20% các loại hoa hồng', '2025-02-09 08:00:00');
(2, 1, 'Giảm giá mùa hè', 'Giảm giá 15% cho tất cả các sản phẩm', '2025-06-01 08:00:00');

-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id_admin`),
  ADD UNIQUE KEY `id_taikhoan` (`id_taikhoan`);

--
-- Chỉ mục cho bảng `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD PRIMARY KEY (`id_donhang`,`id_sanpham`),
  ADD KEY `id_sanpham` (`id_sanpham`);

--
-- Chỉ mục cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  ADD PRIMARY KEY (`id_danhgia`),
  ADD KEY `id_khachhang` (`id_khachhang`),
  ADD KEY `id_sanpham` (`id_sanpham`);

--
-- Chỉ mục cho bảng `donhang`
--
ALTER TABLE `donhang`
  ADD PRIMARY KEY (`id_donhang`),
  ADD KEY `id_khachhang` (`id_khachhang`);

--
-- Chỉ mục cho bảng `khachhang`
--
ALTER TABLE `khachhang`
  ADD PRIMARY KEY (`id_khachhang`),
  ADD UNIQUE KEY `id_taikhoan` (`id_taikhoan`);

--
-- Chỉ mục cho bảng `khuyenmai`
--
ALTER TABLE `khuyenmai`
  ADD PRIMARY KEY (`id_khuyenmai`);

--
-- Chỉ mục cho bảng `loaihoa`
--
ALTER TABLE `loaihoa`
  ADD PRIMARY KEY (`id_loaihoa`);

--
-- Chỉ mục cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  ADD PRIMARY KEY (`id_sanpham`),
  ADD KEY `id_loaihoa` (`id_loaihoa`),
  ADD KEY `id_khuyenmai` (`id_khuyenmai`);

--
-- Chỉ mục cho bảng `taikhoan`
--
ALTER TABLE `taikhoan`
  ADD PRIMARY KEY (`id_taikhoan`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  ADD PRIMARY KEY (`id_thongbao`),
  ADD KEY `id_admin` (`id_admin`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `admin`
--
ALTER TABLE `admin`
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  MODIFY `id_danhgia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `donhang`
--
ALTER TABLE `donhang`
  MODIFY `id_donhang` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `khachhang`
--
ALTER TABLE `khachhang`
  MODIFY `id_khachhang` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `khuyenmai`
--
ALTER TABLE `khuyenmai`
  MODIFY `id_khuyenmai` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `loaihoa`
--
ALTER TABLE `loaihoa`
  MODIFY `id_loaihoa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  MODIFY `id_sanpham` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `taikhoan`
--
ALTER TABLE `taikhoan`
  MODIFY `id_taikhoan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  MODIFY `id_thongbao` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `admin`
--
ALTER TABLE `admin`
  ADD CONSTRAINT `admin_ibfk_1` FOREIGN KEY (`id_taikhoan`) REFERENCES `taikhoan` (`id_taikhoan`);

--
-- Các ràng buộc cho bảng `chitietdonhang`
--
ALTER TABLE `chitietdonhang`
  ADD CONSTRAINT `chitietdonhang_ibfk_1` FOREIGN KEY (`id_donhang`) REFERENCES `donhang` (`id_donhang`),
  ADD CONSTRAINT `chitietdonhang_ibfk_2` FOREIGN KEY (`id_sanpham`) REFERENCES `sanpham` (`id_sanpham`);

--
-- Các ràng buộc cho bảng `danhgia`
--
ALTER TABLE `danhgia`
  ADD CONSTRAINT `danhgia_ibfk_1` FOREIGN KEY (`id_khachhang`) REFERENCES `khachhang` (`id_khachhang`),
  ADD CONSTRAINT `danhgia_ibfk_2` FOREIGN KEY (`id_sanpham`) REFERENCES `sanpham` (`id_sanpham`);

--
-- Các ràng buộc cho bảng `donhang`
--
ALTER TABLE `donhang`
  ADD CONSTRAINT `donhang_ibfk_1` FOREIGN KEY (`id_khachhang`) REFERENCES `khachhang` (`id_khachhang`);

--
-- Các ràng buộc cho bảng `khachhang`
--
ALTER TABLE `khachhang`
  ADD CONSTRAINT `khachhang_ibfk_1` FOREIGN KEY (`id_taikhoan`) REFERENCES `taikhoan` (`id_taikhoan`);

--
-- Các ràng buộc cho bảng `sanpham`
--
ALTER TABLE `sanpham`
  ADD CONSTRAINT `sanpham_ibfk_1` FOREIGN KEY (`id_loaihoa`) REFERENCES `loaihoa` (`id_loaihoa`),
  ADD CONSTRAINT `sanpham_ibfk_2` FOREIGN KEY (`id_khuyenmai`) REFERENCES `khuyenmai` (`id_khuyenmai`);

--
-- Các ràng buộc cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  ADD CONSTRAINT `thongbao_ibfk_1` FOREIGN KEY (`id_admin`) REFERENCES `admin` (`id_admin`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
