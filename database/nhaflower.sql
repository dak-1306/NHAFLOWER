-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th8 17, 2025 lúc 10:30 AM
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
(2, 2, 2, 150000.00),
(6, 1, 1, 250000.00),
(6, 2, 1, 150000.00),
(7, 2, 1, 150000.00);

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
(2, 2, 2, 4, 'Tươi và thơm, rất hài lòng.', '2025-07-23 16:00:00'),
(3, 20, 2, 5, 'đẹp quá', '2025-08-16 16:30:10');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `donhang`
--

CREATE TABLE `donhang` (
  `id_donhang` int(11) NOT NULL,
  `id_khachhang` int(11) NOT NULL,
  `ngay_dat` datetime DEFAULT NULL,
  `dia_chi_giao` text DEFAULT NULL,
  `trang_thai` enum('cho','dang_giao','hoan_tat','huy') DEFAULT 'cho'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `donhang`
--

INSERT INTO `donhang` (`id_donhang`, `id_khachhang`, `ngay_dat`, `dia_chi_giao`, `trang_thai`) VALUES
(1, 1, '2025-07-22 10:00:00', '123 Lê Lợi, Quận 1', 'dang_giao'),
(2, 2, '2025-07-23 14:00:00', '456 Cách Mạng, Quận 3', ''),
(3, 1, '2025-08-08 21:14:39', '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM', 'hoan_tat'),
(4, 1, '2025-08-08 21:14:39', '456 Đường DEF, Phường UVW, Quận 3, TP.HCM', 'dang_giao'),
(5, 1, '2025-08-08 21:14:39', '789 Đường GHI, Phường RST, Quận 7, TP.HCM', 'cho'),
(6, 20, '2025-08-14 15:36:00', 'Bình Thạnh, tpHCM', 'cho'),
(7, 20, '2025-08-16 20:35:41', 'Bình Thạnh, tpHCM', 'huy');

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
(16, 20, 'Trần Văn B', '0919315800', 'HCM', NULL),
(17, 21, 'Trần Hải Đăng', '0839479444', 'HCM', '2000-06-13'),
(18, 22, 'Sample User', '0987654321', 'Test Address', '1995-05-05'),
(19, 23, 'Hồ Tấn Đạt', '0911526555', 'tp hcm', '2004-01-14'),
(20, 24, 'Trần Hải Đăng', '0839479444', 'Bình thạnh, HCM', NULL),
(21, 25, 'Trần Đăng', '0839479999', 'Bình thạnh, tpHCM', '2000-01-01');

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
(1, 'Ưu đãi cho dịp lễ tình nhân', 20, '2025-02-10', '2025-02-15');

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
  `hinh_anh` varchar(255) DEFAULT NULL,
  `trang_thai` enum('active','inactive') DEFAULT 'active',
  `ngay_tao` timestamp NOT NULL DEFAULT current_timestamp(),
  `ngay_capnhat` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `sanpham`
--

INSERT INTO `sanpham` (`id_sanpham`, `ten_hoa`, `gia`, `mo_ta`, `so_luong`, `id_loaihoa`, `id_khuyenmai`, `hinh_anh`, `trang_thai`, `ngay_tao`, `ngay_capnhat`) VALUES
(1, 'Hoa Hồng Đỏ', 250000.00, 'Bó hoa hồng đỏ tươi đẹp', 10, 1, 1, 'hoa_hong_do.jpg', 'active', '2025-08-11 12:30:41', '2025-08-11 12:30:41'),
(2, 'Hoa Cúc Trắng', 150000.00, 'Hoa cúc trắng tinh khôi', 20, 2, NULL, 'hoa_cuc_trang.jpg', 'active', '2025-08-11 12:30:41', '2025-08-11 12:30:41');

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
(20, 'thd123@gmail.com', '$2y$10$x6QiPVHIWhrsJrU/V6mcvOscfmB1KuwH7mKJCV9Q69Sc/0I2.wiAe', 'khach', 1),
(21, 'thd1234@gmail.com', '$2y$10$vd4eSi6I.ubNeovUlILjGOFyT3znFftQvXVP.a9ClZtvpPnSKn4rW', 'khach', 1),
(22, 'newuser@test.com', '$2y$10$98OMctxyAHOaDYME4jfUjeqO.Dt9p3UGArGWWijBWrlC8Q//cIqWW', 'khach', 1),
(23, 'ngmuahoa@gmail.com', '$2y$10$RLx10Fc7kes6RJoEEklt7eYQ50NOrXYG8ReSwTmUSTfpNXBAnqKi2', 'khach', 1),
(24, 'dang1234@gmail.com', '$2y$10$m5rRsQ51nJ9STPAqBoEPGe7SWQ7m9SgAkoUvrY.U.1l.DlvBFanB.', 'khach', 1),
(25, 'dang123456@gmail.com', '$2y$10$OipLQR2ZsjE3aOKggY/lIeHSPtwXFg/cRMBuF0cykwCdMZjxlYy5e', 'khach', 1);

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

--
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
  MODIFY `id_danhgia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `donhang`
--
ALTER TABLE `donhang`
  MODIFY `id_donhang` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `khachhang`
--
ALTER TABLE `khachhang`
  MODIFY `id_khachhang` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

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
  MODIFY `id_taikhoan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

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
