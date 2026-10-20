const CAR_TYPES = [
  { name: "Sedan", icon: "fa-car-side" },
  { name: "SUV", icon: "fa-truck-monster" },
  { name: "Crossover", icon: "fa-car-rear" },
  { name: "Hatchback", icon: "fa-car" },
  { name: "MPV", icon: "fa-van-shuttle" },
  { name: "Bán tải", icon: "fa-truck-pickup" },
  { name: "Xe điện", icon: "fa-bolt" },
  { name: "Xe sang", icon: "fa-gem" }
];

const BRANDS = ["Toyota", "Honda", "Mazda", "Hyundai", "Kia", "Ford", "VinFast", "BMW", "Mercedes-Benz", "BYD"];


const CARS = [
  { id: 1,  brand: "Toyota",        name: "Toyota Vios",   version: "1.5 CVT",       year: 2022, price: 480000000,   type: "Sedan",     seats: 5, fuel: "Xăng",   transmission: "Tự động", featured: true,  badges: ["Nổi bật"], image: "../images/xe01.jpg" },
  { id: 2,  brand: "Honda",         name: "Honda Civic",   version: "1.5 G",     year: 2022, price: 650000000,  type: "Sedan",       seats: 5, fuel: "Xăng",   transmission: "Tự động", featured: true,  badges: ["Ưu đãi"],  image: "../images/xe02.jpg" },
  { id: 3,  brand: "Mazda",         name: "Mazda CX-5",    version: "Premium",     year: 2020, price: 560000000,   type: "Crossover", seats: 5, fuel: "Xăng",   transmission: "Tự động", featured: true,  badges: [],          image: "../images/xe03.jpg" },
  { id: 4,  brand: "Hyundai",       name: "Hyundai Tucson", version: "2.0L",        year: 2021, price: 720000000,   type: "SUV",      seats: 5, fuel: "Xăng",   transmission: "Tự động", featured: false, badges: ["Nổi bật"], image: "../images/xe04.jpg" },
  { id: 5,  brand: "Kia",           name: "Kia Seltos",    version: "1.4 Turbo",   year: 2022, price: 600000000,   type: "SUV",      seats: 5, fuel: "Xăng",   transmission: "Tự động", featured: false, badges: [],          image: "../images/xe05.jpg" },
  { id: 6,  brand: "Ford",          name: "Ford Ranger",   version: "Wildtrak",    year: 2021, price: 800000000,   type: "Bán tải", seats: 5, fuel: "Dầu",    transmission: "Tự động", featured: true,  badges: ["Ưu đãi"], image: "../images/xe06.jpg" },
  { id: 7,  brand: "VinFast",       name: "VinFast VF e34",version: "Tiêu chuẩn", year: 2022, price: 690000000,   type: "Xe điện", seats: 5, fuel: "Điện",   transmission: "Tự động", featured: false, badges: [],          image: "../images/xe07.jpg" },
  { id: 8,  brand: "BMW",           name: "BMW X5",        version: "xDrive40i",   year: 2021, price: 4500000000,  type: "SUV",      seats: 5, fuel: "Xăng",   transmission: "Tự động", featured: true,  badges: ["Nổi bật"], image: "../images/xe08.jpg" },
  { id: 9,  brand: "Mercedes-Benz", name: "Mercedes GLC",  version: "200 4MATIC", year: 2024, price: 2500000000,  type: "SUV",      seats: 5, fuel: "Xăng",   transmission: "Tự động", featured: false, badges: [],          image: "../images/xe09.jpg" },
  { id: 10, brand: "BYD",           name: "BYD Atto 3",    version: "Tiêu chuẩn", year: 2024, price: 800000000,   type: "Xe điện", seats: 5, fuel: "Điện",   transmission: "Tự động", featured: false, badges: ["Ưu đãi"], image: "../images/xe10.jpg" }
  
  
];

const PROMO_KINDS = ["Giảm giá", "Hỗ trợ trả góp", "Quà tặng"];
const PROMOTIONS = [
  { id: 1, title: "Ưu đãi mùa cuối năm", desc: "Giảm giá trực tiếp cho các mẫu SUV và Crossover .", discount: "Giảm 20 triệu", kind: "Giảm giá", start: "2026-10-01", end: "2026-12-31", brand: "hyudai", conditions: ["Áp dụng cho khách đặt mua trong thời gian chương trình", "Không cộng dồn với ưu đãi khác", "Số lượng có hạn "], image: "../images/xe04.jpg" },
  { id: 2, title: "Tuần lễ xe điện", desc: "Hỗ trợ tư vấn trả góp cho dòng xe điện.", discount: "Hỗ trợ lãi suất", kind: "Hỗ trợ trả góp", start: "2026-11-01", end: "2026-11-30", brand: "VinFast", conditions: ["Áp dụng cho dòng xe điện", "Cần đăng ký tư vấn trả góp trước", "Nội dung minh họa, không phải ưu đãi thật"], image: "../images/xe02.jpg" },
  { id: 3, title: "Lái thử nhận quà", desc: "Đăng ký lái thử tại showroom mẫu và nhận quà tặng .", discount: "Quà tặng", kind: "Quà tặng", start: "2026-10-10", end: "2026-12-15", brand: "Toyota", conditions: ["Mỗi khách nhận một phần quà", "Cần đặt lịch lái thử trước", "Nội dung minh họa"], image: "../images/xe01.jpg" },
];
const NEWS_CATEGORIES = ["Tin tức ô tô" ];
const NEWS = [
  { id: 1, category: "Tư vấn mua xe", title: "5 điều cần kiểm tra trước khi chốt mua chiếc xe đầu tiên", date: "2026-10-12", excerpt: "Từ ngân sách, nhu cầu sử dụng đến chi phí nuôi xe, đây là danh sách giúp bạn quyết định tự tin hơn.", image: "../images/news05.jpg",
    sections: [{ h: "Xác định ngân sách thực tế", p: "Ngoài giá xe, hãy tính thêm bảo hiểm, nhiên liệu, gửi xe và bảo dưỡng định kỳ để biết số tiền bạn thực sự cần mỗi tháng." }, { h: "Chọn theo nhu cầu, không theo phong trào", p: "Nếu chủ yếu đi trong phố, xe nhỏ gọn dễ xoay trở. Nếu thường đi xa cùng gia đình, không gian và độ êm ái nên được ưu tiên." }, { h: "Lái thử trước khi quyết định", p: "Cảm giác ngồi, tầm nhìn và độ ồn chỉ rõ ràng khi bạn tự cầm lái. Hãy dành ít nhất 20 phút cho một buổi lái thử." }] },
  { id: 2, category: "Đánh giá xe", title: "SUV 7 chỗ cho gia đình: nên ưu tiên tiêu chí nào?", date: "2026-10-09", excerpt: "Không gian hàng ghế thứ ba, an toàn và mức tiêu thụ nhiên liệu là ba điểm đáng cân nhắc.", image: "../images/news03.jpg",
    sections: [{ h: "Không gian hàng ghế thứ ba", p: "Hãy ngồi thử ở hàng ghế cuối để xem chỗ để chân và khả năng gập ghế khi cần chở hành lý." }, { h: "An toàn cho cả gia đình", p: "Ưu tiên các trang bị hỗ trợ người lái và số túi khí, đồng thời kiểm tra thông tin an toàn từ nhà sản xuất." }] },
  { id: 3, category: "Công nghệ ô tô", title: "Xe điện hoạt động thế nào và có phù hợp với bạn?", date: "2026-10-05", excerpt: "Tìm hiểu cơ bản về pin, sạc và chi phí vận hành của xe điện.", image: "../images/news04.jpg",
    sections: [{ h: "Nguyên lý cơ bản", p: "Xe điện dùng động cơ điện lấy năng lượng từ pin, vì vậy không cần xăng hay dầu và có ít chi tiết chuyển động hơn." }, { h: "Điều cần cân nhắc", p: "Hãy xem bạn có chỗ sạc tại nhà hoặc gần nơi làm việc không, và quãng đường đi hằng ngày có phù hợp với phạm vi di chuyển của xe." }] },
  { id: 4, category: "So sánh xe", title: "Sedan hay Crossover: chọn dòng xe nào cho đi lại hằng ngày?", date: "2026-09-28", excerpt: "So sánh về gầm xe, không gian, khả năng vận hành trong đô thị.", image: "../images/news06.jpg",
    sections: [{ h: "Sedan", p: "Trọng tâm thấp, vận hành ổn định và thường êm ái, phù hợp người ưu tiên cảm giác lái và di chuyển trên đường tốt." }, { h: "Crossover", p: "Gầm cao hơn, tầm nhìn tốt và khoang chứa đồ linh hoạt, phù hợp khi phải đi qua những đoạn đường xấu hoặc ngập nhẹ." }] },
  { id: 5, category: "Tư vấn mua xe", title: "Cách chọn xe phù hợp với nhu cầu sử dụng", date: "2026-09-20", excerpt: "Hướng dẫn lựa chọn xe dựa trên thói quen sử dụng và điều kiện tài chính.", image: "../images/news01.jpg",
    sections: [{ h: "Những thông số nên xem trước", p: "Số chỗ ngồi, loại nhiên liệu, hộp số và kích thước tổng thể là các thông tin giúp bạn loại bớt lựa chọn không phù hợp." }, { h: "So sánh trên cùng một tiêu chí", p: "Hãy so sánh các xe cùng phân khúc và cùng phiên bản để kết quả có ý nghĩa." }] }
];