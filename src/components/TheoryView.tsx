import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Play, Code, AlertCircle, MessageSquare, Send, Sparkles, 
  ChevronRight, Brain, CircleDot, ChevronDown, CheckCircle2, Award,
  Search, Filter, Heart, RotateCcw, Gamepad2, X, Lock, Unlock, Printer, Download, Trophy
} from 'lucide-react';
import { Message } from '../types';
import { CodeHighlight } from './CodeHighlight';
import { playAudioCue } from '../utils/audio';

interface TheoryViewProps {
  onNavigate: (view: 'home' | 'theory' | 'ide' | 'arena' | 'leaderboard') => void;
}

// Rich static content mapping for each of the 7 syllabus chapters
const LESSON_CONTENTS: Record<string, {
  subtitle: string;
  title: string;
  visualLabel: string;
  visualItems: { label: string; highlight?: boolean; accent?: boolean }[];
  visualExp: string;
  intro: string;
  theoryTab: React.ReactNode;
  pseudocodeTab: React.ReactNode;
  complexityTab: React.ReactNode;
  aiStarter: string;
  aiContext: string;
  quickPrompts: string[];
}> = {
  '1': {
    subtitle: 'BÀI 1: TỔNG QUAN VỀ THUẬT TOÁN & BIG O',
    title: 'Lý thuyết Độ phức tạp thuật toán và Big O Notation',
    visualLabel: 'Độ tăng trưởng Big O (Tốc độ chạy từ nhanh đến chậm):',
    visualItems: [
      { label: 'O(1) - Hằng số', highlight: true },
      { label: 'O(log N) - Logarithm', accent: true },
      { label: 'O(N) - Tuyến tính' },
      { label: 'O(N log N) - Tuyến tính nhân log' },
      { label: 'O(N²) - Bình phương' }
    ],
    visualExp: 'Biểu đồ tăng trưởng cho thấy rõ lý do vì sao một thuật toán O(log N) tối ưu hơn O(N) rất nhiều khi tập dữ liệu lớn lên.',
    intro: 'Độ phức tạp thuật toán (Big O Notation) là công cụ toán học dùng để ước lượng lượng tài nguyên (thời gian xử lý hoặc không gian bộ nhớ) mà một thuật toán tiêu hao tương quan với kích thước dữ liệu đầu vào N.',
    theoryTab: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Khái niệm cốt lõi về Big O</h3>
        <p className="text-sm text-gray-300">
          Khi đánh giá thuật toán, chúng ta không dùng đơn vị giây/mili-giây vì thời gian chạy thực tế phụ thuộc rất lớn vào phần cứng của máy tính, hệ điều hành và ngôn ngữ lập trình. Thay vào đó, <strong>Big O</strong> đo lường <strong>số lượng phép tính cơ bản</strong> mà thuật toán phải thực hiện theo kích thước đầu vào N.
        </p>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl leading-relaxed text-xs text-gray-400">
          <p className="font-bold text-gray-200 mb-1">Các quy tắc tính hiệu năng Big O phổ biến:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Bỏ qua hằng số:</strong> O(2N) sẽ tương đương O(N). O(5) tương đương O(1).</li>
            <li><strong>Giữ lại bậc cao nhất:</strong> O(N² + N) giữ lại O(N²).</li>
            <li><strong>Độ phức tạp bộ nhớ (Space Complexity):</strong> Đo lượng bộ nhớ phụ phát sinh ngoài dữ liệu đầu vào trong quá trình tính toán.</li>
          </ul>
        </div>
      </div>
    ),
    pseudocodeTab: (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Mẫu Thuật Toán Linear Search & Binary Search (Pseudocode)</h3>
        <CodeHighlight 
          language="cpp"
          title="Linear & Binary Search"
          code={`// 1. Tìm kiếm tuyến tính (Linear Search) - Độ phức tạp O(N)
int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i; // O(1) trung bình chạy N lần
    }
    return -1;
}

// 2. Tìm kiếm nhị phân (Binary Search) - Độ phức tạp O(log N) (Đã sắp xếp)
int binarySearch(int arr[], int low, int high, int target) {
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`}
        />
      </div>
    ),
    complexityTab: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">So sánh độ phức tạp thời gian trực quan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-950/10 border border-indigo-500/20 p-5 rounded-xl text-left">
            <span className="text-gray-400 text-xs font-semibold block mb-1">TỐT NHẤT (EXCELLENT)</span>
            <span className="text-xl font-mono font-bold text-indigo-400 block mb-2">O(1) hoặc O(log N)</span>
            <p className="text-xs text-gray-500 leading-relaxed">Tìm kiếm nhị phân, truy xuất mảng bằng chỉ số, tra cứu HashTable.</p>
          </div>
          <div className="bg-emerald-950/10 border border-emerald-500/20 p-5 rounded-xl text-left">
            <span className="text-gray-400 text-xs font-semibold block mb-1">TRUNG BÌNH (ACCEPTABLE)</span>
            <span className="text-xl font-mono font-bold text-emerald-400 block mb-2">O(N) hoặc O(N log N)</span>
            <p className="text-xs text-gray-500 leading-relaxed">Tìm kiếm tuyến tính, thuật toán sắp xếp tối ưu (Merge Sort, Quick Sort trung bình).</p>
          </div>
          <div className="bg-rose-950/10 border border-rose-500/20 p-5 rounded-xl text-left">
            <span className="text-gray-400 text-xs font-semibold block mb-1">TỆ / NGUY HIỂM (VERY SLOW)</span>
            <span className="text-xl font-mono font-bold text-rose-400 block mb-2">O(N²) hoặc O(2^N)</span>
            <p className="text-xs text-gray-500 leading-relaxed">Các vòng lặp lồng nhau sâu (Bubble Sort), Đệ quy Fibonacci thô sơ vô nhớ.</p>
          </div>
        </div>
      </div>
    ),
    aiStarter: 'Chào bạn học viên! Mình là Algo AI. Hôm nay chúng ta học về **Độ phức tạp Big O (Big O Notation)**. Hãy hỏi mình bất kỳ thắc mắc nào về cách tối ưu hoá vòng lặp và đo lường tài nguyên nhé! 🚀',
    aiContext: 'Bài giảng lý thuyết về độ phức tạp thời gian (Time Complexity), độ phức tạp không gian (Space Complexity), các quy tắc Big O và tối ưu hoá vòng lặp.',
    quickPrompts: [
      "Tại sao không đo hiệu thuật toán bằng giây?",
      "Độ phức tạp O(log N) hoạt động như thế nào?",
      "Làm sao xác định độ phức tạp vòng lặp lồng nhau?"
    ]
  },
  '2': {
    subtitle: 'BÀI 2: MẢNG & DANH SÁCH LIÊN KẾT',
    title: 'Lý thuyết Cấu trúc dữ liệu Mảng tĩnh và Danh sách liên kết (Linked List)',
    visualLabel: 'So sánh cấu trúc lưu trữ và phân bổ ô nhớ:',
    visualItems: [
      { label: 'Mảng tĩnh: [A | B | C | D] (Bộ nhớ RAM liên tiếp)', highlight: true },
      { label: 'Danh sách liên kết: [Node A] ➔ [Node B] ➔ [Node C]', accent: true }
    ],
    visualExp: 'Mảng có lợi thế truy xuất siêu nhanh bằng chỉ vị trí index O(1), trong khi Danh sách liên kết có lợi thế chèn/xóa cực nhanh không tốn công dịch chuyển phần tử.',
    intro: 'Mảng và Danh sách liên kết là hai cấu trúc dữ liệu đường thẳng cơ bản nhất. Việc hiểu sâu sắc sự khác biệt trong kiến trúc phần cứng của chúng giúp bạn chọn lựa phương án tổ chức dữ liệu thông minh.',
    theoryTab: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">So sánh chi tiết cơ chế vật lý</h3>
        <p className="text-sm text-gray-300">
          <strong>Mảng tĩnh (Array):</strong> Cấp phát một khối bộ nhớ <em>liên tục</em> trên RAM ngay từ đầu. Do đó địa chỉ ô thứ i được tính bằng công thức: <code className="text-indigo-400 bg-slate-950 px-1 py-0.5 rounded font-mono">Địa chỉ_gốc + i * kích_thước_Type</code>. Điều này giúp lấy phần tử là O(1) lập tức.
        </p>
        <p className="text-sm text-gray-300">
          <strong>Danh sách liên kết (Linked List):</strong> Phân bổ các phần tử (Node) <em>phân tán nhiều nơi</em> trong bộ nhớ Heap. Mỗi Node gồm giá trị dữ liệu và địa chỉ của Node tiếp theo. Ta buộc phải duyệt tuần tự từ đầu danh sách để tìm Node mong muốn (mất O(N) thời gian nhảy địa chỉ).
        </p>
      </div>
    ),
    pseudocodeTab: (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Định nghĩa Cấu trúc một Node trong C++</h3>
        <CodeHighlight 
          language="cpp"
          title="Linked List C++ struct & insert"
          code={`struct Node {
    int data;         // Phần lưu trữ dữ liệu
    Node* next;       // Con trỏ trỏ đến Node tiếp theo trong danh sách

    Node(int val) {
        data = val;
        next = nullptr;
    }
};

// Chèn Node vào đầu danh sách liên kết đơn (O(1))
void insertAtHead(Node* &head, int newVal) {
    Node* newNode = new Node(newVal);
    newNode->next = head;
    head = newNode;
}`}
        />
      </div>
    ),
    complexityTab: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Bảng so sánh thời gian thực thi (Big O)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl text-left">
            <h4 className="font-bold text-indigo-400 mb-2">Ưresource/NHƯỢC ĐIỂM CỦA MẢNG</h4>
            <ul className="text-xs text-gray-405 text-gray-400 list-disc pl-4 space-y-1 leading-relaxed">
              <li>Lấy phần tử bằng chỉ số: <strong className="text-emerald-400">O(1)</strong></li>
              <li>Chèn/Xóa phần tử ở giữa: <strong className="text-rose-400">O(N)</strong> (vì phải dồn dịch toàn bộ các phần tử kề sau)</li>
              <li>Kích thước mảng tĩnh: Cố định, cực kỳ khó mở rộng lúc runtime</li>
            </ul>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl text-left">
            <h4 className="font-bold text-emerald-400 mb-2">Ưresource/NHƯỢC ĐIỂM CỦA LINKED LIST</h4>
            <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1 leading-relaxed">
              <li>Lấy phần tử ở xa: <strong className="text-rose-400">O(N)</strong> (phải nhảy liên tiếp từ head)</li>
              <li>Chèn/Xóa ở vị trí biết trước: <strong className="text-emerald-400">O(1)</strong> (chỉ bẻ gãy liên kết con trỏ, không dịch chuyển mảng)</li>
              <li>Kích thước năng động: Tăng giảm tùy ý cực kỳ linh hoạt vô hạn</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    aiStarter: 'Xin chào! Mình là Algo AI. Bạn có muốn so sánh chi tiết hoặc hỏi mình về cách đảo ngược một **Danh sách liên kết đơn (Reverse Linked List)** không? Mình luôn sẵn sàng vẽ cấu trúc ra giải thích nhé! 💡',
    aiContext: 'Bài giảng lý thuyết về mảng tĩnh, mảng động, danh sách liên kết đơn, danh sách liên kết đôi, so sánh chi tiết chèn xóa truy xuất.',
    quickPrompts: [
      "Khi nào nên dùng Linked List thay mảng?",
      "Làm sao đảo ngược một danh sách liên kết đơn?",
      "Tại sao truy xuất phần tử mảng lại có tốc độ O(1)?"
    ]
  },
  '3': {
    subtitle: 'BÀI 3: CẤU TRÚC ĐỆ QUY & QUY HOẠCH ĐỒNG',
    title: 'Lý thuyết Đệ quy (Recursion) và Quy hoạch động (Dynamic Programming)',
    visualLabel: 'Cơ chế Đệ quy có Nhớ (Memoization) cứu vớt Stack:',
    visualItems: [
      { label: 'Hàm tính: F(n) = F(n-1) + F(n-2)' },
      { label: 'Nhập bộ nhớ tủ đệm Cache trạng thái đã tính', highlight: true, accent: true }
    ],
    visualExp: 'Đệ quy thô sơ gánh chịu hậu quả tính trùng lặp O(2^N), khi được áp dụng bộ lưu trạng thái Memoization của Quy hoạch động, độ phức tạp được rút xuống O(N).',
    intro: 'Đệ quy là giải pháp lập trình kêu gọi chính hàm đó tự thực hiện ở quy mô dữ liệu nhỏ hơn. Quy hoạch động (Dynamic Programming) là phiên bản tiến hóa tối ưu đệ quy giúp hệ thống ghi nhớ trạng thái cũ nhằm tiết kiệm tài nguyên tính toán.',
    theoryTab: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Chìa khóa chuyển hóa</h3>
        <p className="text-sm text-gray-300">
          Mỗi hàm đệ quy bắt buộc phải sở hữu hai phần tối quan trọng: <strong>Trường hợp gốc (Base Case)</strong> để chặn đệ quy dừng lại và <strong>Không gian quy nạp đệ quy</strong>. Nếu thiếu Base Case, chương trình sẽ gọi lặp vô tận gây lỗi tràn bộ nhớ xử lý <em>Stack Overflow</em>.
        </p>
        <p className="text-sm text-gray-300">
          Quy hoạch động khắc chế sự lãng phí của đệ quy bằng cách giải quyết các bài toán con đè nhau (Overlapping Subproblems) thông qua hai phương pháp: <strong>Top-down (Memoization - Lưu nhớ từ đỉnh xuống)</strong> hoặc <strong>Bottom-up (Tabulation - Đi từ đáy lập bảng)</strong>.
        </p>
      </div>
    ),
    pseudocodeTab: (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Quy hoạch động tính Fibonacci (Bottom-up O(N))</h3>
        <CodeHighlight 
          language="cpp"
          title="Fibonacci DP in O(1) Space"
          code={`// Fibonacci dùng quy hoạch động tối ưu không gian bộ nhớ O(1) Auxiliary Space
int fibonacciDP(int n) {
    if (n <= 1) return n;
    
    int prev2 = 0; // f(0)
    int prev1 = 1; // f(1)
    int current = 0;
    
    for (int i = 2; i <= n; i++) {
        current = prev1 + prev2; // f(i) = f(i-1) + f(i-2)
        prev2 = prev1;
        prev1 = current; // Cập nhật trạng thái
    }
    return current;
}`}
        />
      </div>
    ),
    complexityTab: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">So sánh sự biến chuyển hiệu năng</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl text-left">
            <h4 className="font-bold text-rose-450 text-rose-400 mb-2 font-mono">ĐỆ QUY ĐƠN THUẦN (Naïve Recursion)</h4>
            <p className="text-xs text-gray-400">Độ phức tạp thời gian: <strong className="text-rose-550 text-rose-500 font-mono">O(2^N)</strong></p>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">Phép tính bị tính lặp lại hàng triệu lần. Tính F(40) có thể làm máy đơ hoàn toàn vì tạo ra hàng tỷ lời gọi đè nặng Stack.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4.5 rounded-xl text-left">
            <h4 className="font-bold text-emerald-400 mb-2 font-mono">QUY HOẠCH ĐỘNG (Dynamic Programming)</h4>
            <p className="text-xs text-gray-400">Độ phức tạp thời gian: <strong className="text-emerald-500 font-mono">O(N)</strong></p>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">Mỗi bài toán con chỉ được giải đúng một lần duy nhất. Thời gian chạy tức thì chỉ trong tíc tắc đối với các bài toán có N lên tới hàng triệu.</p>
          </div>
        </div>
      </div>
    ),
    aiStarter: 'Chào bạn học! Mình là Algo AI. Chúng ta hãy cùng làm chủ tư duy **Đệ quy** và chuyển đổi nó thành **Quy hoạch động (DP)** cực kỳ tối ưu nhé! Bạn có thắc mắc gì về quy hoạch trạng thái không? 🧠',
    aiContext: 'Bài giảng lý thuyết về đệ quy, điều kiện dừng, tràn bộ nhớ stack, quy hoạch động, memoization, lập bảng triangulation.',
    quickPrompts: [
      "Làm cách nào xử lý lỗi Tràn bộ nhớ (Stack Overflow)?",
      "Bài toán Cái Túi (Knapsack) kinh điển giải bằng Quy hoạch động thế nào?",
      "Top-down (Memoization) khác gì Bottom-up (Tabulation)?"
    ]
  },
  '4': {
    subtitle: 'BÀI 4: THUẬT TOÁN SẮP XẾP CƠ BẢN',
    title: 'Lý thuyết Bubble Sort, Selection Sort & Insertion Sort',
    visualLabel: 'Cơ chế hoạt động của thuật xếp cơ bản:',
    visualItems: [
      { label: 'Bubble Sort: Đổ dồn dập các cặp kề để dồn số lớn nhất về cuối', highlight: true },
      { label: 'Selection Sort: Quét mảng tìm số bé nhất đưa về đầu hàng', accent: true },
      { label: 'Insertion Sort: Chèn số mới vào đúng vị trí trong đoạn đã sort' }
    ],
    visualExp: 'Mặc dù cả ba đều đạt độ phức tạp O(N^2) trong trường hợp xấu nhất, chúng là cấu trúc nền móng quan trọng để phát triển các tư duy sắp xếp siêu việt sau này.',
    intro: 'Sắp xếp dữ liệu là vấn đề cơ bản bậc nhất của khoa học máy tính. Ba thuật toán sơ đẳng Bubble Sort, Selection Sort và Insertion Sort giúp bạn hiểu rõ bản chất hoán đổi và định hình luồng mảng.',
    theoryTab: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Phân tích hành vi hoạt động</h3>
        <p className="text-sm text-gray-300">
          <strong>Bubble Sort (Nổi bọt):</strong> Duyệt nhiều vòng, ở mỗi vòng liên tiếp so sánh các cặp số kề nhau, nếu sai số thứ tự thì hoán đổi. Phần tử lớn nhất sẽ "nổi" dần về cuối mảng như bọt khí dâng cao.
        </p>
        <p className="text-sm text-gray-300">
          <strong>Selection Sort (Chọn):</strong> Chia mảng thành phần đã sort và chưa sort. Ở mỗi vòng duyệt qua phần chưa sort, tìm vị trí số nhỏ nhất hiện tại và hoán đổi nó lên đầu của phần chưa sort.
        </p>
        <p className="text-sm text-gray-300">
          <strong>Insertion Sort (Chèn):</strong> Duyệt từ trái qua phải, lấy từng số và "chen chân" nó vào đúng vị trí thích hợp trong đoạn mảng nằm bên trái nó vốn dĩ đã được sắp xếp đầu tiên trước đó.
        </p>
      </div>
    ),
    pseudocodeTab: (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Thuật toán Insertion Sort trong C++</h3>
        <CodeHighlight 
          language="cpp"
          title="Insertion Sort Algorithm"
          code={`void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i]; // Quân bài đang xem xét để chèn
        int j = i - 1;

        // Dịch chuyển các phần tử lớn hơn key lên một vị trí kề sau
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key; // Đưa key vào vị trí trống phù hợp
    }
}`}
        />
      </div>
    ),
    complexityTab: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">So sánh độ phức tạp tính toán chi tiết</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-950/10 border border-indigo-500/20 p-5 rounded-xl text-left text-xs">
            <h4 className="font-bold text-indigo-400 mb-1">BUBBLE SORT</h4>
            <p className="text-[11px] text-gray-400">Worst Case: <strong>O(N²)</strong></p>
            <p className="text-[11px] text-gray-400">Best Case: <strong>O(N)</strong> (Có dùng cờ hiệu tối ưu)</p>
            <p className="text-gray-500 mt-2 leading-relaxed">Dễ viết nhất nhưng cực kỳ chậm với dữ liệu có quy mô trung bình lớn.</p>
          </div>
          <div className="bg-emerald-950/10 border border-emerald-500/20 p-5 rounded-xl text-left text-xs">
            <h4 className="font-bold text-emerald-400 mb-1">SELECTION SORT</h4>
            <p className="text-[11px] text-gray-400">Worst Case: <strong>O(N²)</strong></p>
            <p className="text-[11px] text-gray-400">Best Case: <strong>O(N²)</strong></p>
            <p className="text-gray-500 mt-2 leading-relaxed">Yêu cầu vô cùng ít phép hoán vị swap thực sự nhưng luôn phải duyệt hết.</p>
          </div>
          <div className="bg-rose-950/10 border border-rose-500/20 p-5 rounded-xl text-left text-xs">
            <h4 className="font-bold text-rose-400 mb-1">INSERTION SORT</h4>
            <p className="text-[11px] text-gray-400">Worst Case: <strong>O(N²)</strong></p>
            <p className="text-[11px] text-gray-400">Best Case: <strong>O(N)</strong></p>
            <p className="text-gray-500 mt-2 leading-relaxed">Thuật toán tốt nhất nhóm cơ bản khi mảng đã gần sắp xếp từ trước.</p>
          </div>
        </div>
      </div>
    ),
    aiStarter: 'Chào bạn! Hãy cùng Algo AI khám phá các thuật toán **Sắp xếp cơ bản** như Nổi bọt, Chọn và Chèn nhé! Luôn sẵn lòng phân dịch thuật toán trong một cái chớp mắt ⚡',
    aiContext: 'Bài giảng lý thuyết về các thuật toán sắp xếp sơ cấp Bubble Sort, Selection Sort, Insertion Sort, độ phức tạp trung bình và tối ưu cờ hiệu.',
    quickPrompts: [
      "Tại sao Insertion Sort chạy nhanh hơn Bubble Sort mặc dù cùng O(N^2)?",
      "Sắp xếp ổn định (Stable Sorting) có ý nghĩa thực tế gì?",
      "Cờ hiệu flag nâng cấp Bubble Sort O(N) hoạt động thế nào?"
    ]
  },
  '5': {
    subtitle: 'BÀI 5: THUẬT TOÁN SẮP XẾP NHANH',
    title: 'Lý thuyết Quick Sort (Sắp xếp nhanh)',
    visualLabel: 'quick_sort.cpp - Live Preview phân hoạch:',
    visualItems: [
      { label: '[8' },
      { label: '2' },
      { label: '4' },
      { label: '7' },
      { label: '1]' },
      { label: '3 (Chốt)', highlight: true, accent: true }
    ],
    visualExp: 'Mảng được quét phân tách: các phần tử nhỏ hơn 3 sang trái, lớn hơn 3 sang phải, rồi đệ quy xử lý.',
    intro: 'Quick Sort áp dụng chiến lược Chia để trị (Divide and Conquer). Nó chia mảng thành hai phần dựa trên một giá trị gọi là phần tử chốt (pivot), giải quyết cực kỳ tối ưu độ phức tạp trong thực tế.',
    theoryTab: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Cách thức hoạt động: 3 Công đoạn cốt lõi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left">
            <span className="font-bold text-indigo-400 block mb-2">1. Chọn Pivot</span>
            <p className="text-slate-500 leading-relaxed">Đặt pivot bằng phần tử cuối (Lomuto), đầu, ở giữa hoặc chọn ngẫu nhiên để khắc chế worst case.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left">
            <span className="font-bold text-emerald-400 block mb-2">2. Phân hoạch</span>
            <p className="text-slate-500 leading-relaxed">Chuyển các phần tử nhỏ hơn pivot về trái, các số lớn hơn về phải. Chốt trả về vị trí chuẩn xác.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left">
            <span className="font-bold text-purple-400 block mb-2">3. Đệ quy thuật</span>
            <p className="text-slate-500 leading-relaxed">Tái lặp đệ quy cho hai mảng con độc lập bên trái và phải của pivot cho đến khi kích thước mảng mỏng dần.</p>
          </div>
        </div>
      </div>
    ),
    pseudocodeTab: (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Mẫu Thuật Toán Pseudocode (Phân hoạch Lomuto)</h3>
        <CodeHighlight 
          language="cpp"
          title="Quick Sort (Lomuto Partition)"
          code={`int partition(int arr[], int low, int high) {
    int pivot = arr[high]; // Chọn phần tử cuối cùng làm chốt
    int i = low - 1;       // Chỉ số của phần tử nhỏ hơn chốt
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++; swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`}
        />
      </div>
    ),
    complexityTab: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Đánh giá độ phức tạp thuật toán</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-indigo-950/10 border border-indigo-500/20 p-4 rounded-xl text-left">
            <span className="font-bold text-indigo-400 block mb-1">BEST: O(N log N)</span>
            <p className="text-gray-500 leading-relaxed">Xảy ra khi mỗi bước phân hoạch đều chia đôi mảng chuẩn xác cực kỳ cân bằng.</p>
          </div>
          <div className="bg-emerald-950/10 border border-emerald-500/20 p-4 rounded-xl text-left">
            <span className="font-bold text-emerald-400 block mb-1">AVG: O(N log N)</span>
            <p className="text-gray-500 leading-relaxed">Xảy ra phần lớn trường hợp mảng xáo trộn tự nhiên. Đây là hiệu năng thực tế.</p>
          </div>
          <div className="bg-rose-950/10 border border-rose-500/20 p-4 rounded-xl text-left">
            <span className="font-bold text-rose-400 block mb-1">WORST: O(N²)</span>
            <p className="text-gray-500 leading-relaxed">Xảy ra khi mảng đã được sort từ trước và ta liên tiếp chọn phần tử cuối lệch.</p>
          </div>
        </div>
      </div>
    ),
    aiStarter: 'Chào bạn! Mình là Algo AI. Hôm nay chúng ta cùng học về **Quick Sort (Sắp xếp nhanh)** nhé. Bạn có thắc mắc gì về phân hoạch Hoare, Lomuto hay cách chọn phần tử chốt (pivot) không? ⚡',
    aiContext: 'Bài giảng lý thuyết về thuật toán Quick Sort, phân hoạch Lomuto, Hoare và độ phức tạp tính toán O(N log N).',
    quickPrompts: [
      "Giải thích phân hoạch Lomuto?",
      "Tại sao Quick Sort chạy O(N^2) trong worst-case?",
      "Cách chọn pivot tối ưu nhất là gì?"
    ]
  },
  '6': {
    subtitle: 'BÀI 6: SẮP XẾP TRỘN MERGE SORT',
    title: 'Lý thuyết Sắp xếp trộn (Merge Sort)',
    visualLabel: 'Quy trình chia và Trộn (Merge):',
    visualItems: [
      { label: 'Chia: [8, 3] & [5, 1]' },
      { label: 'Trộn mảng bé: [3, 8] & [1, 5]' },
      { label: 'Hợp nhất xong: [1, 3, 5, 8]', highlight: true, accent: true }
    ],
    visualExp: 'Khác với Quick Sort dựa vào Partition, Merge Sort dựa tuyệt đối vào quá trình Trộn (Merge) hai mảng con đã sort thành một mảng thống nhất.',
    intro: 'Sắp xếp trộn (Merge Sort) là một thuật toán sắp xếp dựa trên mô hình Divide and Conquer cực kỳ vững chãi. Cho dù cấu trúc mảng tệ hại đến đâu, Merge Sort vẫn đảm bảo hiệu năng tối ưu lý tưởng O(N log N).',
    theoryTab: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Xây dựng vững vàng</h3>
        <p className="text-sm text-gray-300">
          Merge Sort liên tục chia đôi mảng hiện tại thành hai nửa cho đến khi kích thước mảng con chỉ còn đúng 1 phần tử (mảng có một phần tử luôn coi như đã sắp xếp). Tiếp đó, thuật toán hợp nhất (merge) các mảng đơn lẻ này lại với nhau theo thứ tự tăng dần.
        </p>
        <p className="text-sm text-gray-300">
          <strong>Tính ổn định (Stability):</strong> Merge Sort bảo lưu trọn vẹn thứ tự ban đầu của các phần tử có giá trị bằng nhau. Đây là điểm mạnh vượt trội hơn Quick Sort khi sắp xếp các đối tượng phức tạp như danh sách theo tên tuổi.
        </p>
      </div>
    ),
    pseudocodeTab: (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Hàm Merge hai mảng con tuyển chọn</h3>
        <CodeHighlight 
          language="cpp"
          title="Merge Sort Utility"
          code={`// Trộn hai mảng con arr[l..m] và arr[m+1..r]
void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1;
    int n2 = r - m;
    int L[n1], R[n2]; // Tạo mảng phụ trợ lưu dữ liệu
    
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) { arr[k] = L[i]; i++; }
        else { arr[k] = R[j]; j++; }
        k++;
    }
    while (i < n1) { arr[k] = L[i]; i++; k++; }
    while (j < n2) { arr[k] = R[j]; j++; k++; }
}`}
        />
      </div>
    ),
    complexityTab: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Phân tích chi tiết Tài nguyên tiêu hao</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left">
            <span className="font-bold text-indigo-400 block mb-1 font-mono">THỜI GIAN: O(N log N) HẰNG ĐỊNH</span>
            <p className="text-gray-500 leading-relaxed">Luôn là O(N log N) cho cả góc độ tốt nhất, trung bình hay tệ hại nhất vì mảng luôn bị bẻ đôi đối xứng hoàn mỹ tại mọi node.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left">
            <span className="font-bold text-rose-400 block mb-1 font-mono">BỘ NHỚ: O(N) AUXILIARY SPACE</span>
            <p className="text-gray-550 text-gray-500 leading-relaxed">Yếu điểm lớn là tốn thêm bộ nhớ tạm thời tỷ lệ thuận với số phần tử N để tổ chức trộn. Khó sắp xếp tại chỗ (In-place) trên mảng tĩnh.</p>
          </div>
        </div>
      </div>
    ),
    aiStarter: 'Chào bạn học viên! Mình là Algo AI. Hôm nay chúng ta cùng học về **Merge Sort (Sắp xếp trộn)** - một giải thuật chia để trị cực kỳ ổn định với Big O luôn là O(N log N) nhé! 🌟',
    aiContext: 'Bài giảng lý thuyết về sắp xếp trộn Merge Sort, độ phức tạp bộ nhớ phụ thuộc mảng phụ trợ O(N) và tính chất ổn định.',
    quickPrompts: [
      "Tại sao Merge Sort cần mảng phụ trợ O(N) còn Quick Sort thì không?",
      "Ổn định (Stability) của thuật xếp có nghĩa là gì?",
      "Merge Sort chạy tốt khi dữ liệu là danh sách liên kết không?"
    ]
  },
  '7': {
    subtitle: 'BÀI 7: TÌM KIẾM THEO CHIỀU RỘNG (BFS)',
    title: 'Lý thuyết Duyệt đồ thị theo Chiều rộng (Breadth-First Search)',
    visualLabel: 'Trạng thái Queue & Đỉnh đã thăm:',
    visualItems: [
      { label: 'Hàng tuyển Queue: [A] ➔ Thăm đỉnh A' },
      { label: 'Queue kế: [B, C] (Láng giềng kề của A)', highlight: true },
      { label: 'Duyệt loang đều theo từng lớp sóng nước kề gần', accent: true }
    ],
    visualExp: 'BFS loang rộng theo từng lớp sóng nước kề cận, sử dụng cấu trúc hàng đợi Queue (First In, First Out) định hình đỉnh duyệt tiếp theo.',
    intro: 'Tìm kiếm theo chiều rộng (BFS) là thuật toán căn bản để quản lý mạng lưới đường đi, duyệt đồ thị, khảo sát nhanh nhất các liên kết tầm gần trước khi mở rộng ra tầm xa.',
    theoryTab: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Phương thức Loang làn sóng</h3>
        <p className="text-sm text-gray-300">
          Khác với DFS (Tìm kiếm chiều sâu) đâm đầu vào một hướng sâu nhất có thể, <strong>BFS</strong> lan tỏa đồng đều mọi hướng kề. Trọng tâm cốt tủy của BFS là cấu trúc hàng đợi <strong>Queue (First In First Out)</strong>. Khi lấy đỉnh đầu hàng đợi ra thăm, ta đồng thời dồn hết tất cả láng giềng kề của nó đại diện (chưa thăm) vào đuôi hàng đợi.
        </p>
        <p className="text-sm text-gray-300">
          <strong>Ứng dụng đường đi ngắn nhất:</strong> BFS hứa hẹn tìm thấy đường đi qua ít cạnh nhất từ gốc tới đích trên bất kỳ đồ thị nào không có trọng số.
        </p>
      </div>
    ),
    pseudocodeTab: (
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Đoạn Code BFS lý thuyết bằng C++</h3>
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-4 font-mono text-[11px] text-indigo-200 overflow-x-auto relative">
          <div className="absolute top-4 right-4 bg-slate-950/80 text-gray-500 text-[10px] px-2 py-1 rounded">
            C++ Graph BFS
          </div>
          <pre className="text-left space-y-1">
{`void BFS(int start, vector<vector<int>>& adj) {
    vector<bool> visited(adj.size(), false);
    queue<int> q;

    visited[start] = true;
    q.push(start); // Đưa đỉnh khởi đầu vào Queue

    while (!q.empty()) {
        int u = q.front(); q.pop();
        cout << u << " "; // Thao tác xử lý nút

        // Quét qua các đỉnh kề v chưa thăm của u
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v); // Thêm bạn kề vào Queue
            }
        }
    }
}`}
          </pre>
        </div>
      </div>
    ),
    complexityTab: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Xem xét độ phức tạp đồ thị</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left">
            <span className="font-bold text-indigo-400 block mb-1 font-mono">THỜI GIAN: O(V + E)</span>
            <p className="text-gray-500 leading-relaxed">V là số lượng Đỉnh, E là số lượng Cạnh. Thuật toán ghé thăm mọi đỉnh một lần và khảo sát qua tất cả mọi cạnh của đồ thị.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left">
            <span className="font-bold text-emerald-400 block mb-1 font-mono">BỘ NHỚ PHÁT SINH: O(V)</span>
            <p className="text-gray-500 leading-relaxed font-sans">Mất không gian lưu trữ mảng đánh dấu `visited` và cấu trúc `Queue` chứa đỉnh loang láng giềng biên giới.</p>
          </div>
        </div>
      </div>
    ),
    aiStarter: 'Hello bạn học! Hãy cùng Algo AI khám phá thuật toán **Tìm kiếm theo chiều rộng (BFS)** trên đồ thị nhé. Mình luôn sẵn lòng phân tích Queue và các ứng dụng thực tế tìm đường ngắn nhất! 🗺️',
    aiContext: 'Bài giảng lý thuyết về duyệt đồ thị BFS, DFS, cấu trúc hàng đợi Queue, đường đi ngắn nhất đồ thị không trọng số.',
    quickPrompts: [
      "Tại sao BFS tìm được đường ngắn nhất trong đồ thị vô trọng số?",
      "So sánh chi tiết DFS và BFS về mặt tốn dung lượng RAM?",
      "BFS ứng dụng thế nào để giải bài toán Maze (Mê cung)?"
    ]
  }
};

const LESSON_DIFFICULTY: Record<string, 'easy' | 'medium' | 'hard'> = {
  '1': 'easy',
  '2': 'easy',
  '3': 'hard',
  '4': 'easy',
  '5': 'medium',
  '6': 'medium',
  '7': 'medium'
};

const DIFFICULTY_LABELS: Record<'easy' | 'medium' | 'hard', { text: string; colorClass: string }> = {
  easy: { text: 'Dễ', colorClass: 'text-emerald-400 bg-emerald-500/10' },
  medium: { text: 'Trung bình', colorClass: 'text-amber-400 bg-amber-500/10' },
  hard: { text: 'Khó', colorClass: 'text-rose-400 bg-rose-500/10' }
};

interface QuizQuestion {
  id: string;
  courseTitle: string;
  requirement: string;
  codeText: string;
  correctAnswers: Record<number, string>;
  options: string[];
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'python_conditions',
    courseTitle: '30 Days to learn Python 🤯🔥',
    requirement: 'In ra 🪫 nếu năng lượng (energy) bé hơn 5, ngược lại in ra 🔋.',
    codeText: 'energy = 3\n[gap_0] energy [gap_1] 5:\n    print("🪫")\n[gap_2]:\n    print("🔋")',
    correctAnswers: {
      0: 'if',
      1: '<',
      2: 'else'
    },
    options: ['if', '<', 'else', '>', 'elif', '==', 'while', 'print'],
    explanation: 'Cấu trúc rẽ nhánh trong Python sử dụng "if" để kiểm tra điều kiện (ở đây là energy < 5) và kết thúc bằng "else:" cho phần code chạy khi không thoả mãn.'
  },
  {
    id: 'array_indexing',
    courseTitle: 'Cơ bản về Mảng & Indexing ⚡',
    requirement: 'Học tuyệt chiêu: Lấy phần tử cuối cùng của danh sách fruits để in ra quả dưa hấu 🍉.',
    codeText: 'fruits = ["🍎", "💥", "🍉"]\nlast_fruit = fruits[[gap_0]]\nprint(last_fruit)  # Kết quả: 🍉',
    correctAnswers: {
      0: '-1'
    },
    options: ['-1', '0', '3', 'len', 'pop', '2', 'append'],
    explanation: 'Trong Python, chỉ số âm -1 giúp truy cập trực tiếp phần tử cuối cùng của mảng vô cùng nhanh gọn mà không cần tính độ dài.'
  },
  {
    id: 'factorial_recursion',
    courseTitle: 'Đệ quy Cơ bản 🌀',
    requirement: 'Hoàn thành hàm Đệ quy tính giai thừa n! với trường hợp dừng (base case) chuẩn xác.',
    codeText: 'def factorial(n):\n    [gap_0] n <= 1:\n        return [gap_1]\n    return n * factorial(n - 1)',
    correctAnswers: {
      0: 'if',
      1: '1'
    },
    options: ['if', '1', 'else', '0', 'return', 'n', 'while'],
    explanation: 'Trường hợp cơ sở (Base Case) cực kỳ quan trọng trong đệ quy để dừng lặp. Nếu n <= 1 thì factorial(n) dừng và trả về 1.'
  },
  {
    id: 'bfs_queue',
    courseTitle: 'Tìm kiếm theo chiều rộng BFS 🛰️',
    requirement: 'Thêm nút bắt đầu vào hàng đợi (Queue - FIFO) và lấy nút đầu tiên ra duyệt.',
    codeText: 'queue = []\nqueue.[gap_0](start_node)  # Thêm vào cuối\nwhile len(queue) > 0:\n    current = queue.[gap_1](0) # Lấy từ đầu hàng đợi',
    correctAnswers: {
      0: 'append',
      1: 'pop'
    },
    options: ['append', 'pop', 'push', 'shift', 'insert', 'remove'],
    explanation: 'Thuật toán BFS sử dụng Queue (FIFO). Ta dùng append() để thêm phần tử vào cuối, và pop(0) lấy phần tử đầu từ đầu hàng đợi.'
  },
  {
    id: 'quicksort_partition',
    courseTitle: 'Quick Sort: Phân hoạch chốt 🏹',
    requirement: 'Dịch chuyển chỉ số i sang phải khi phần tử hiện tại còn nhỏ hơn phần tử chốt (pivot).',
    codeText: 'while i < j:\n    [gap_0] arr[i] [gap_1] pivot:\n        i += 1',
    correctAnswers: {
      0: 'if',
      1: '<'
    },
    options: ['if', '<', '>', 'while', '==', 'elif', 'else'],
    explanation: 'Trong bước phân hoạch (Partition) của Quick Sort, ta dịch i sang phải miễn là arr[i] bé hơn pivot để chia mảng thành hai nửa.'
  }
];

const MasterAvatar = () => (
  <svg viewBox="0 0 160 160" className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-xl select-none shrink-0" aria-hidden="true">
    <circle cx="80" cy="80" r="75" className="fill-slate-900 stroke-slate-800" strokeWidth="2" />
    <path d="M40 140 L80 100 L120 140 C100 155, 60 155, 40 140 Z" className="fill-emerald-800" />
    <path d="M55 140 L80 108 L105 140" className="fill-emerald-700" />
    <path d="M72 108 L80 125 L88 108" className="fill-amber-100" />
    <circle cx="80" cy="82" r="32" className="fill-orange-100" />
    <path d="M60 92 C55 104, 75 108, 80 96 C85 108, 105 104, 100 92 C90 92, 70 92, 60 92 Z" className="fill-white" />
    <circle cx="80" cy="94" r="5" className="fill-white" />
    <circle cx="48" cy="80" r="16" className="fill-white" />
    <circle cx="112" cy="80" r="16" className="fill-white" />
    <circle cx="80" cy="48" r="22" className="fill-white" />
    <path d="M58 52 C58 35, 102 35, 102 52 Z" className="fill-white" />
    <circle cx="80" cy="26" r="6" className="fill-slate-100" />
    <circle cx="68" cy="74" r="8" className="fill-white" />
    <circle cx="92" cy="74" r="8" className="fill-white" />
    <circle cx="68" cy="74" r="4.5" className="fill-slate-950" />
    <circle cx="92" cy="74" r="4.5" className="fill-slate-950" />
    <circle cx="70" cy="72" r="1.5" className="fill-white" />
    <circle cx="94" cy="72" r="1.5" className="fill-white" />
    <ellipse cx="80" cy="81" rx="8" ry="6" className="fill-orange-200" />
    <path d="M58 64 C64 58, 76 60, 76 64" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M102 64 C96 58, 84 60, 84 64" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
  </svg>
);

export default function TheoryView({ onNavigate }: TheoryViewProps) {
  const [activeTab, setActiveTab] = useState<'theory' | 'pseudocode' | 'complexity' | 'interactive_quiz'>('theory');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Interactive Quiz States
  const [quizIndex, setQuizIndex] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [activeSlotId, setActiveSlotId] = useState<number>(0);
  const [quizStatus, setQuizStatus] = useState<'idle' | 'correct' | 'wrong' | 'game_over' | 'completed'>('idle');
  const [wrongShake, setWrongShake] = useState(false);

  // New Interactive Modal, Toast, Cert states
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customCertName, setCustomCertName] = useState('Minh Hoàng');
  const [highlightedLessonId, setHighlightedLessonId] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => prev === message ? null : prev);
    }, 3000);
  };

  const handleSelectOption = (option: string) => {
    if (quizStatus === 'correct' || quizStatus === 'wrong') return;
    
    // Find the slot to place the option
    let targetSlot = activeSlotId;
    const currentQ = QUIZ_QUESTIONS[quizIndex];
    const totalGaps = Object.keys(currentQ.correctAnswers).length;
    
    if (selectedAnswers[targetSlot]) {
      let found = -1;
      for (let i = 0; i < totalGaps; i++) {
        if (!selectedAnswers[i]) {
          found = i;
          break;
        }
      }
      if (found !== -1) {
        targetSlot = found;
      }
    }
    
    setSelectedAnswers(prev => ({
      ...prev,
      [targetSlot]: option
    }));
    playAudioCue('tick');
    
    const nextSlot = targetSlot + 1;
    if (nextSlot < totalGaps) {
      setActiveSlotId(nextSlot);
    }
  };

  const handleClearSlot = (slotId: number) => {
    if (quizStatus === 'correct' || quizStatus === 'wrong') return;
    setSelectedAnswers(prev => {
      const copy = { ...prev };
      delete copy[slotId];
      return copy;
    });
    playAudioCue('click');
    setActiveSlotId(slotId);
  };

  const handleCheckQuiz = () => {
    const currentQ = QUIZ_QUESTIONS[quizIndex];
    let isAllCorrect = true;
    
    for (const slotKey in currentQ.correctAnswers) {
      const slotNum = parseInt(slotKey, 10);
      if (selectedAnswers[slotNum] !== currentQ.correctAnswers[slotNum]) {
        isAllCorrect = false;
        break;
      }
    }
    
    if (isAllCorrect) {
      setQuizStatus('correct');
      playAudioCue('success');
// Award XP only (no streak/daily increment)
      const event = new CustomEvent('algolearn_award_xp', { detail: { amount: 50 } });
      window.dispatchEvent(event);
    } else {
      setQuizStatus('wrong');
      playAudioCue('fail');
      setHearts(prev => {
        const nextHearts = prev - 1;
        if (nextHearts <= 0) {
          setQuizStatus('game_over');
        }
        return nextHearts;
      });
      setWrongShake(true);
      setTimeout(() => setWrongShake(false), 500);
    }
  };

  const handleNextQuizQuestion = () => {
    const nextIndex = quizIndex + 1;
    playAudioCue('click');
    if (nextIndex < QUIZ_QUESTIONS.length) {
      setQuizIndex(nextIndex);
      setSelectedAnswers({});
      setActiveSlotId(0);
      setQuizStatus('idle');
    } else {
      setQuizStatus('completed');
    }
  };

  const handleRestartQuiz = () => {
    playAudioCue('success');
    setQuizIndex(0);
    setHearts(5);
    setSelectedAnswers({});
    setActiveSlotId(0);
    setQuizStatus('idle');
  };

  const defaultSyllabus = [
    { id: '1', title: 'Bài 1: Tổng quan về Thuật toán & Big O', progress: 100, active: false },
    { id: '2', title: 'Bài 2: Mảng & Danh sách liên kết', progress: 100, active: false },
    { id: '3', title: 'Bài 3: Cấu trúc Đệ quy & Quy hoạch động', progress: 80, active: false },
    { id: '4', title: 'Bài 4: Thuật toán Sắp xếp cơ bản', progress: 100, active: false },
    { id: '5', title: 'Bài 5: Thuật toán Quick Sort', progress: 0, active: true },
    { id: '6', title: 'Bài 6: Sắp xếp trộn Merge Sort', progress: 0, active: false },
    { id: '7', title: 'Bài 7: Tìm kiếm theo Chiều rộng (BFS)', progress: 0, active: false },
  ];

  const [syllabus, setSyllabus] = useState(() => {
    try {
      const saved = localStorage.getItem('algolearn_syllabus');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultSyllabus;
  });

  // Fetch the number of solved programming exercises dynamically from localStorage
  const userSolvedCount = (() => {
    try {
      return parseInt(localStorage.getItem('algolearn_user_solved') || '63', 10);
    } catch (_) {
      return 63;
    }
  })();

  // Recommendation engine based on completed exercises and syllabus progress
  const getRecommendation = () => {
    // 1. First, find a lesson that is started but incomplete (0 < progress < 100)
    const ongoing = syllabus.find(item => item.progress > 0 && item.progress < 100);
    if (ongoing) {
      const diff = ongoing.difficulty || LESSON_DIFFICULTY[ongoing.id] || 'easy';
      const label = DIFFICULTY_LABELS[diff];
      return {
        lesson: ongoing,
        type: 'ongoing',
        reason: `Bạn đang tự ôn luyện dở dang bài này (tiến độ đạt ${ongoing.progress}%). Hãy tiếp tục hoàn thành bài cũ để lấp đầy khoảng trống kiến thức nhé!`,
        badgeColor: label.colorClass,
        badgeText: `Đang học dở (${ongoing.progress}%)`
      };
    }

    // 2. Otherwise recommend the first uncompleted lesson (progress === 0)
    const nextLesson = syllabus.find(item => item.progress === 0);
    if (nextLesson) {
      const diff = nextLesson.difficulty || LESSON_DIFFICULTY[nextLesson.id] || 'easy';
      const label = DIFFICULTY_LABELS[diff];
      return {
        lesson: nextLesson,
        type: 'next',
        reason: `Dựa trên lộ trình cá nhân hóa, bạn đã giải tốt các bài trước. Đây là mốc lý thuyết tiếp theo bạn nên khai phá để lập trình tự tin hơn!`,
        badgeColor: label.colorClass,
        badgeText: `Học tiếp lộ trình`
      };
    }

    // 3. If all lessons are 100% completed, offer review tips
    const reviewLesson = syllabus.find(item => item.id === '3') || syllabus[0];
    const diff = reviewLesson.difficulty || LESSON_DIFFICULTY[reviewLesson.id] || 'hard';
    const label = DIFFICULTY_LABELS[diff];
    return {
      lesson: reviewLesson,
      type: 'review',
      reason: `Tuyệt vời! Bạn đã hoàn thành 100% giáo trình thuật toán. Hãy ôn luyện lại bài học Đệ quy & Quy hoạch động - mảng kiến thức nâng cao cực kỳ quan trọng!`,
      badgeColor: label.colorClass,
      badgeText: `Ôn tập đề xuất`
    };
  };

  const rec = getRecommendation();

  // Filtered syllabus items based on search and difficulty level
  const filteredSyllabus = syllabus.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const difficulty = item.difficulty || LESSON_DIFFICULTY[item.id] || 'easy';
    const matchesDifficulty = difficultyFilter === 'all' || difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  // Pick the currently active lesson item
  const activeItem = syllabus.find(item => item.active) || syllabus.find(item => item.id === '5') || syllabus[0];
  const currentContent = LESSON_CONTENTS[activeItem.id] || LESSON_CONTENTS['5'];

  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize welcome message whenever currently active lesson switches
  useEffect(() => {
    setMessages([
      {
        id: `initial-welcome-${activeItem.id}-${Date.now()}`,
        sender: 'ai',
        text: currentContent.aiStarter,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [activeItem.id]);

  const fetchSyllabusFromServer = async () => {
    try {
      const res = await fetch('/api/syllabus');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSyllabus(data);
      }
    } catch (e) {
      console.error("Failed to fetch syllabus from server in TheoryView:", e);
    }
  };

  useEffect(() => {
    fetchSyllabusFromServer();

    const handleSyllabusUpdated = () => {
      fetchSyllabusFromServer();
    };

    window.addEventListener('algolearn_syllabus_updated', handleSyllabusUpdated);
    return () => {
      window.removeEventListener('algolearn_syllabus_updated', handleSyllabusUpdated);
    };
  }, []);

  const totalLessons = syllabus.length;
  const completedLessons = syllabus.filter(item => item.progress === 100).length;
  const totalProgressSum = syllabus.reduce((acc, curr) => acc + curr.progress, 0);
  const overallProgressPercent = Math.round(totalProgressSum / totalLessons);

  const quickPrompts = currentContent.quickPrompts;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingAi]);

  // Handle manual selection/switching to a specific lesson (completed or not)
  const handleSelectLesson = async (id: string) => {
    // Scroll element into view smoothly in both sidebar lists and mobile lists
    setTimeout(() => {
      const element = document.getElementById(`lesson_item_${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 80);

    setHighlightedLessonId(id);
    setTimeout(() => {
      setHighlightedLessonId(null);
    }, 1500);

    const targetLessonItem = syllabus.find(item => item.id === id);
    if (targetLessonItem) {
      showToast(`📖 Đang xem: ${targetLessonItem.title}`);
    }

    // 1. Optimistic local state switch
    const optimisticallyUpdated = syllabus.map(item => ({
      ...item,
      active: item.id === id
    }));
    setSyllabus(optimisticallyUpdated);
    setActiveTab('theory');

    // 2. Clear input
    setInputMessage('');

    // 3. Post to full stack server to save state
    try {
      const res = await fetch('/api/syllabus/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.syllabus || data;
        if (Array.isArray(list)) {
          setSyllabus(list);
        }
        window.dispatchEvent(new CustomEvent('algolearn_syllabus_updated'));
      }
    } catch (err) {
      console.error("Failed to select active lesson on server:", err);
    }
  };

  // Dedicated progress modifier accessible dynamically by user to toggle progress
  const handleUpdateLessonProgress = async (id: string, progress: number) => {
    const updatedSyllabus = syllabus.map(item => {
      if (item.id === id) {
        return { ...item, progress };
      }
      return item;
    });

    setSyllabus(updatedSyllabus);

    const lessonItem = syllabus.find(item => item.id === id);
    if (lessonItem) {
      if (progress === 100) {
        showToast(`🎉 Xuất sắc! Bạn đã hoàn thành: ${lessonItem.title}`);
      } else {
        showToast(`Cập nhật tiến độ: ${lessonItem.title} (${progress}%)`);
      }
    }

    try {
      const res = await fetch('/api/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syllabus: updatedSyllabus })
      });
      if (res.ok) {
        const data = await res.json();
        const list = data.syllabus || data;
        if (Array.isArray(list)) {
          setSyllabus(list);
        }
        window.dispatchEvent(new CustomEvent('algolearn_syllabus_updated'));
      }
    } catch (err) {
      console.error("Failed to update syllabus progress on server, fall back:", err);
      try {
        localStorage.setItem('algolearn_syllabus', JSON.stringify(updatedSyllabus));
      } catch (_) {}
      window.dispatchEvent(new CustomEvent('algolearn_syllabus_updated'));
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoadingAi(true);

    const activeItem = syllabus.find(item => item.active) || { id: '5' };
    const currentContent = LESSON_CONTENTS[activeItem.id] || LESSON_CONTENTS['5'];

    try {
      const historyPayload = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        text: msg.text
      }));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          context: currentContent.aiContext
        })
      });

      if (!response.ok) {
        throw new Error('Mạng gặp sự cố. Không lấy được phản hồi AI.');
      }

      const data = await response.json();
      
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: any) {
      console.error(error);
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: '⚠️ Xin lỗi bạn, hiện tại kênh kết nối AI bị gián đoạn. Vui lòng thử lại sau hoặc nhập câu hỏi khác!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      id="theory_layout" 
      className="min-h-screen lg:h-[calc(100vh-4rem)] lg:overflow-hidden bg-slate-950 text-gray-200 font-sans flex flex-col"
    >
      <div className="flex-1 flex flex-col lg:flex-row overflow-visible lg:overflow-hidden">
        
        {/* Left Sidebar - Curriculum Trees */}
        <aside id="syllabus_sidebar" className="hidden lg:flex flex-col w-80 border-r border-slate-900 bg-slate-950/60 p-4 shrink-0 overflow-y-auto scrollbar-thin">
          <div className="mb-6 shrink-0">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 mb-1">CHƯƠNG TRÌNH ĐÀO TẠO</h3>
            <p className="text-sm font-bold text-gray-300">Cấu trúc dữ liệu & Giải thuật</p>
            
            {/* Elegant Sidebar Progress Bar */}
            <div 
              onClick={() => setIsProgressModalOpen(true)}
              className="mt-4 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/30 rounded-xl p-3 cursor-pointer group transition-all duration-200 relative shadow-md shadow-slate-950/25"
              title="Nhấp để xem & cập nhật tiến độ chi tiết"
            >
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="text-gray-400 group-hover:text-indigo-300 transition-colors font-medium">Tiến độ khóa học</span>
                <span className="text-indigo-400 font-mono font-bold group-hover:scale-105 transition-all">{overallProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900/60">
                <motion.div 
                   className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full"
                   initial={{ width: 0 }}
                   animate={{ width: `${overallProgressPercent}%` }}
                   transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="text-[9.5px] text-gray-500 mt-1.5 flex justify-between items-center">
                <span className="text-indigo-400/80 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Cập nhật ⚙️</span>
                <span>Đã học xong <span className="text-emerald-400 font-extrabold">{completedLessons}</span>/{totalLessons} bài</span>
              </p>
            </div>
          </div>

          {/* AI Helper Recommendation card */}
          <div className="mb-5 bg-gradient-to-br from-indigo-950/45 via-slate-900/65 to-slate-950/45 border border-indigo-500/25 rounded-2xl p-3.5 shadow-lg relative overflow-hidden group shrink-0">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 blur-xl rounded-full -mr-5 -mt-5" />
            <div className="flex items-center space-x-2 text-indigo-400 mb-2.5 relative z-10">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Gợi Ý Học Tập</span>
            </div>
            
            <div className="text-left relative z-10">
              <p className="text-[10px] text-gray-400 leading-normal mb-2.5">
                Bạn đã giải quyết <strong className="text-emerald-400">{userSolvedCount} bài tập</strong> lập trình thực hành. Đề xuất cá nhân hóa cho bạn:
              </p>
              
              <div className="bg-slate-950/90 border border-slate-900 rounded-xl p-2.5 mb-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md border border-current/10 ${rec.badgeColor}`}>
                    {rec.badgeText}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Lộ trình</span>
                </div>
                <h4 
                  onClick={() => handleSelectLesson(rec.lesson.id)}
                  className="text-xs font-black text-white hover:text-indigo-400 transition-colors cursor-pointer leading-snug"
                >
                  {rec.lesson.title}
                </h4>
                <p className="text-[10px] text-gray-400 leading-relaxed mt-1.5 font-medium">
                  {rec.reason}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSelectLesson(rec.lesson.id)}
                className="w-full inline-flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-2 rounded-xl transition cursor-pointer select-none active:scale-97 hover:shadow-md hover:shadow-indigo-950/50"
              >
                <span>Chinh phục ngay</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search & Filter Section */}
          <div className="mb-4 space-y-2.5 text-left bg-slate-900/20 border border-slate-900/45 p-3 rounded-2xl shrink-0">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm bài học..."
                className="w-full bg-slate-900 border border-slate-800/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-gray-200 placeholder-slate-500 rounded-xl pl-9 pr-8 py-2 outline-none transition"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-gray-300 text-xs cursor-pointer select-none"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Difficulty Filter Buttons */}
            <div>
              <div className="flex items-center space-x-1.5 mb-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Độ khó:</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {(['all', 'easy', 'medium', 'hard'] as const).map((level) => {
                  const isActive = difficultyFilter === level;
                  let label = 'Tất cả';
                  let activeClass = 'bg-indigo-600 text-white font-bold border-indigo-500';
                  if (level === 'easy') {
                    label = 'Dễ';
                    activeClass = 'bg-emerald-500/20 text-emerald-300 font-bold border-emerald-500/40';
                  } else if (level === 'medium') {
                    label = 'Trung bình';
                    activeClass = 'bg-amber-500/20 text-amber-300 font-bold border-amber-500/40';
                  } else if (level === 'hard') {
                    label = 'Khó';
                    activeClass = 'bg-rose-500/20 text-rose-300 font-bold border-rose-500/40';
                  }

                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficultyFilter(level)}
                      className={`text-[9px] py-1 border rounded-lg text-center transition cursor-pointer select-none ${
                        isActive
                          ? activeClass
                          : 'bg-slate-900/50 border-slate-950/40 text-slate-400 hover:bg-slate-900 hover:text-gray-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pb-2">
            {filteredSyllabus.length > 0 ? (
              filteredSyllabus.map((item) => {
                const diff = item.difficulty || LESSON_DIFFICULTY[item.id] || 'easy';
                const diffLabel = DIFFICULTY_LABELS[diff];
                const isSelectedAndFlash = highlightedLessonId === item.id;
                return (
                  <div 
                    key={item.id} 
                    id={`lesson_item_${item.id}`}
                    onClick={() => handleSelectLesson(item.id)}
                    className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer text-left relative focus:outline-none select-none group/item ${
                      item.active 
                        ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-200 shadow-lg ring-1 ring-indigo-500/10' 
                        : 'bg-slate-900/45 border-slate-900 hover:border-slate-800 hover:bg-slate-900/70 text-gray-400'
                    } ${
                      isSelectedAndFlash ? 'ring-2 ring-indigo-500 scale-[1.02] border-indigo-500 bg-indigo-950/20 shadow-md shadow-indigo-950/40 z-10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.progress === 100 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          item.progress > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {item.progress === 100 ? 'Đã học xong' : item.progress > 0 ? `Đang học ${item.progress}%` : 'Chưa học'}
                        </span>
                        
                        {/* Difficulty Badge */}
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-current/15 ${diffLabel.colorClass}`}>
                          {diffLabel.text}
                        </span>
                      </div>
                      {item.active ? (
                        <CircleDot className="w-4.5 h-4.5 text-indigo-400 animate-pulse shrink-0" />
                      ) : item.progress === 100 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500/60 group-hover/item:text-emerald-400 transition-colors shrink-0" />
                      ) : null}
                    </div>
                    <p className={`text-xs sm:text-sm font-bold leading-snug transition-colors ${item.active ? 'text-white' : 'group-hover/item:text-gray-200'}`}>{item.title}</p>
                    
                    {/* Visual mini-tip instructing user to review */}
                    {item.progress === 100 && (
                      <span className="absolute bottom-1 right-2 text-[8px] font-medium text-emerald-500/40 opacity-0 group-hover/item:opacity-100 transition-opacity">Nhấp để xem lại học thuyết ➔</span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-5 text-center">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-400">Không tìm thấy bài học!</p>
                <p className="text-[10px] text-gray-500 mt-1 leading-normal">Vui lòng điều chỉnh từ khóa hoặc bộ lọc độ khó.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setDifficultyFilter('all');
                  }}
                  className="mt-3 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg hover:bg-indigo-500/20 active:scale-95 transition cursor-pointer"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-slate-900 pt-4 mt-4">
            <div 
              onClick={() => setIsCertificateModalOpen(true)}
              className="flex items-center space-x-3 bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-500/15 hover:border-indigo-500/40 rounded-xl p-3 cursor-pointer transition-all duration-200 select-none group active:scale-97"
              title="Nhấp để mở Chứng nhận học thuật của bạn"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Award className="w-5.5 h-5.5 text-amber-400 animate-pulse" />
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-gray-300 group-hover:text-white transition-colors">Chứng nhận học thuật</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="text-gray-500 text-[9.5px]">Tự do ôn tập mọi bài hoàn thành</span>
                  {overallProgressPercent === 100 ? (
                    <span className="text-[8.5px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 font-extrabold rounded">MỞ</span>
                  ) : (
                    <span className="text-[8.5px] px-1.5 py-0.2 bg-slate-900 text-slate-400 font-extrabold rounded flex items-center gap-0.5">🔒 {overallProgressPercent}%</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center - Content Panels */}
        <main id="theory_main_panel" className="flex-1 flex flex-col bg-slate-950/20 p-4 md:p-6 pb-36 md:pb-48 overflow-visible lg:overflow-y-auto scrollbar-thin">
          {/* Breadcrumb & Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5 mb-6 text-left">
            <div>
              <p className="text-xs text-indigo-400 tracking-wider uppercase font-extrabold">{currentContent.subtitle}</p>
              <h1 className="text-2xl font-black text-white mt-1">{currentContent.title}</h1>
            </div>

            {/* Quick action triggers */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onNavigate('ide')}
                className="inline-flex items-center space-x-1.5 bg-indigo-650 hover:bg-indigo-600 active:scale-95 transition text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-md shadow-indigo-950"
              >
                <Play className="w-4 h-4 text-white fill-white" />
                <span>Thực hành IDE / Code</span>
              </button>
            </div>
          </div>

          {/* Responsive Course Progress Bar (Highly visible on all devices) */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 md:p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5 text-left">
              <div className="w-11 h-11 rounded-xl bg-indigo-950/40 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0 shadow-inner">
                <Award className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">TRẠNG THÁI HIỆN TẠI</h4>
                <p className="text-xs sm:text-sm font-bold text-gray-200 mt-1">
                  {activeItem.progress === 100 ? (
                    <span className="text-emerald-400">Bạn đã hoàn thành bài này! Hiện đang ôn tập học lại lý thuyết. ⚡</span>
                  ) : activeItem.progress > 0 ? (
                    <span className="text-amber-400">Đang tiến trình thực hiện ({activeItem.progress}%) - Hỏi AI trợ giúp đắc lực!</span>
                  ) : (
                    <span>Chưa bắt đầu học bài học này.</span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex-1 max-w-sm w-full">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-gray-500 font-medium">Tiến độ khoá:</span>
                <span className="text-indigo-400 font-bold">{overallProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900 relative">
                <motion.div 
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgressPercent}%` }}
                  transition={{ duration: 1.0, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Mobile responsive selector to let mobile users switch lessons easily */}
          <div className="lg:hidden mb-6 text-left space-y-3">
            {/* Mobile Suggestion Card */}
            <div className="bg-gradient-to-br from-indigo-950/45 via-slate-900/65 to-slate-950/45 border border-indigo-500/25 rounded-2xl p-3.5 shadow-md relative overflow-hidden">
              <div className="flex items-center space-x-2 text-indigo-400 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Gợi ý học tập</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-normal mb-3">
                Bạn đã giải <strong className="text-emerald-400">{userSolvedCount} bài tập</strong> lập trình thực hành. Đề xuất:
              </p>
              
              <div className="bg-slate-950/85 border border-slate-900/60 rounded-xl p-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md border border-current/10 ${rec.badgeColor}`}>
                      {rec.badgeText}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-white truncate">{rec.lesson.title}</h4>
                  <p className="text-[10px] text-gray-400 leading-normal mt-1 text-ellipsis overflow-hidden line-clamp-2">
                    {rec.reason}
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleSelectLesson(rec.lesson.id)}
                  className="bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold text-[10px] px-3 py-2 rounded-xl whitespace-nowrap self-center cursor-pointer active:scale-95 transition shrink-0"
                >
                  Học ngay
                </button>
              </div>
            </div>

            <div className="bg-slate-900/35 border border-slate-900 p-3.5 rounded-2xl space-y-3">
              {/* Search input for mobile */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm bài học..."
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-gray-200 placeholder-slate-500 rounded-xl pl-9 pr-8 py-2.5 outline-none transition"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3 text-slate-500 hover:text-gray-300 text-xs cursor-pointer select-none"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Difficulty filter for mobile */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Độ khó:</span>
                </div>
                
                <div className="flex space-x-1">
                  {(['all', 'easy', 'medium', 'hard'] as const).map((level) => {
                    const isActive = difficultyFilter === level;
                    let label = 'Tất cả';
                    let activeClass = 'bg-indigo-650 text-white font-bold border-indigo-500';
                    if (level === 'easy') {
                      label = 'Dễ';
                      activeClass = 'bg-emerald-500/20 text-emerald-300 font-bold border-emerald-500/40';
                    } else if (level === 'medium') {
                      label = 'T.Bình';
                      activeClass = 'bg-amber-500/20 text-amber-300 font-bold border-amber-500/40';
                    } else if (level === 'hard') {
                      label = 'Khó';
                      activeClass = 'bg-rose-500/20 text-rose-300 font-bold border-rose-500/40';
                    }

                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficultyFilter(level)}
                        className={`text-[9px] px-2 py-1 border rounded-lg text-center transition cursor-pointer select-none font-semibold ${
                          isActive
                            ? activeClass
                            : 'bg-slate-950 border-slate-900 text-slate-500 hover:text-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1.5">Chọn bài học thuật toán ({filteredSyllabus.length}):</label>
              <div className="relative">
                {filteredSyllabus.length > 0 ? (
                  <>
                    <select
                      value={activeItem.id}
                      onChange={(e) => handleSelectLesson(e.target.value)}
                      className="w-full bg-slate-900/90 hover:bg-slate-900 text-gray-200 text-xs font-bold rounded-xl p-3 pr-10 border border-slate-800 focus:outline-none appearance-none outline-none cursor-pointer"
                    >
                      {filteredSyllabus.map(item => {
                        const diff = item.difficulty || LESSON_DIFFICULTY[item.id] || 'easy';
                        const diffText = diff === 'easy' ? 'Dễ' : diff === 'medium' ? 'T.Bình' : 'Khó';
                        return (
                          <option key={item.id} value={item.id}>
                            [{diffText}] {item.title} ({item.progress === 100 ? 'Đã hoàn thành' : `Tiến độ ${item.progress}%`})
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3.5 pointer-events-none" />
                  </>
                ) : (
                  <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 font-bold">Không tìm thấy bài học phù hợp!</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setDifficultyFilter('all');
                      }}
                      className="mt-2 text-[10px] font-bold text-indigo-400 underline cursor-pointer"
                    >
                      Xóa bộ lọc để hiện lại tất cả
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Central Tabs */}
          <div className="flex border-b border-slate-905 border-slate-900 overflow-x-auto space-x-6 mb-6 scrollbar-thin">
            {[
              { id: 'theory', label: 'Lý thuyết cốt lõi', icon: <BookOpen className="w-4.5 h-4.5" /> },
              { id: 'pseudocode', label: 'Pseudocode & Mã mẫu', icon: <Code className="w-4.5 h-4.5" /> },
              { id: 'complexity', label: 'Độ phức tạp Big O', icon: <Brain className="w-4.5 h-4.5" /> },
              { id: 'interactive_quiz', label: 'Luyện tập thú vị 🎮', icon: <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3 border-b-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                  activeTab === tab.id 
                    ? 'border-indigo-500 text-white font-bold' 
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Renderers */}
          <div className="flex-1 text-left space-y-6">
            {activeTab === 'theory' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-gray-300 leading-relaxed text-sm md:text-base max-w-4xl"
              >
                <div className="bg-indigo-950/10 border border-indigo-500/20 rounded-2xl p-5">
                  <div className="flex items-start space-x-3.5">
                    <Sparkles className="w-5.5 h-5.5 text-indigo-400 mt-0.5 shrink-0 animate-pulse" />
                    <div>
                      <h4 className="font-extrabold text-indigo-300">Tóm lược tổng quan:</h4>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
                        {activeItem && activeItem.markdownContent ? "Bài học được chuẩn bị bởi quản lý đào tạo AlgoLearn." : currentContent.intro}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub-tab content injections */}
                {activeItem && activeItem.markdownContent ? (
                  <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 text-gray-300 leading-relaxed font-sans max-w-none text-left">
                    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-300">
                      {activeItem.markdownContent}
                    </div>
                  </div>
                ) : (
                  currentContent.theoryTab
                )}

                {/* Simulated graphical walk (only for built-in lessons) */}
                {(!activeItem || !activeItem.markdownContent) && (
                  <div className="space-y-3 bg-slate-900/30 p-5 rounded-2xl border border-slate-900">
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">{currentContent.visualLabel}</h3>
                    <div className="flex flex-wrap gap-2 pt-2 items-center">
                      {currentContent.visualItems.map((v, i) => (
                        <span 
                          key={i} 
                          className={`p-1.5 px-3 rounded-lg text-xs font-mono font-bold border ${
                            v.highlight ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' :
                            v.accent ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                            'bg-slate-950/80 border-slate-900 text-gray-400'
                          }`}
                        >
                          {v.label}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed mt-2 italic">➔ {currentContent.visualExp}</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'pseudocode' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl"
              >
                {activeItem && activeItem.codeSnippet ? (
                  <CodeHighlight 
                    code={activeItem.codeSnippet} 
                    language="cpp" 
                    title={activeItem.title} 
                  />
                ) : (
                  currentContent.pseudocodeTab
                )}
              </motion.div>
            )}

            {activeTab === 'complexity' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl"
              >
                {currentContent.complexityTab}
              </motion.div>
            )}

            {activeTab === 'interactive_quiz' && (() => {
              const currentQ = QUIZ_QUESTIONS[quizIndex];
              const progressPercent = Math.round(((quizIndex) / QUIZ_QUESTIONS.length) * 100);
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto w-full bg-slate-900/40 border border-slate-900 rounded-3xl p-5 sm:p-7 space-y-6"
                >
                  {/* Quiz Top Metadata & Hearts */}
                  <div className="flex justify-between items-center bg-slate-950/65 border border-slate-900 rounded-2xl p-4 gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                        <span>{currentQ.courseTitle}</span>
                        <span>{quizIndex + 1} / {QUIZ_QUESTIONS.length}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900 relative">
                        <div 
                          className="bg-sky-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Hearts list */}
                    <div className="flex items-center space-x-1.5 p-1.5 bg-rose-950/15 border border-rose-500/10 rounded-xl px-2.5 shrink-0 select-none">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Heart 
                          key={idx} 
                          className={`w-4 h-4 transition-all duration-300 ${
                            idx < hearts 
                              ? 'text-rose-500 fill-rose-500 scale-100 animate-pulse' 
                              : 'text-gray-700 fill-transparent scale-90'
                          }`} 
                        />
                      ))}
                      <span className="text-xs font-black text-rose-500 font-mono ml-1">{hearts}</span>
                    </div>
                  </div>

                  {quizStatus === 'game_over' ? (
                    <motion.div 
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="text-center py-10 space-y-4"
                    >
                      <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500 animate-bounce">
                        <X className="w-10 h-10" />
                      </div>
                      <h2 className="text-xl font-black text-white">Bạn đã hết lượt chơi mất rồi! 💔</h2>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Đừng nản lòng nhé! Trí óc được mài giũa qua từng lần thất bại. Hãy ôn lại lý thuyết bài học và thử sức lại từ đầu!
                      </p>
                      <button
                        onClick={handleRestartQuiz}
                        type="button"
                        className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 border border-indigo-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition active:scale-95 cursor-pointer flex items-center space-x-2 mx-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Thử lại từ đầu</span>
                      </button>
                    </motion.div>
                  ) : quizStatus === 'completed' ? (
                    <motion.div 
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="text-center py-10 space-y-4"
                    >
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                        <Award className="w-10 h-10" />
                      </div>
                      <h2 className="text-xl font-black text-white">Tốt nghiệp Thử thách Duolingo Code! 🎓🏆</h2>
                      <p className="text-sm text-sky-400 max-w-sm mx-auto leading-relaxed font-bold">
                        Xin chúc mừng! Bạn đã chinh phục xuất sắc mọi mốc thử thách rẽ nhánh, mảng đệ quy và cấu trúc dữ liệu!
                      </p>
                      <p className="text-xs text-slate-400">Tài khoản của bạn đã được tích lũy thêm XP thành công.</p>
                      
                      <div className="pt-2 flex justify-center gap-3">
                        <button
                          onClick={handleRestartQuiz}
                          type="button"
                          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-gray-300 rounded-xl text-xs font-extrabold uppercase tracking-wider transition active:scale-95 cursor-pointer flex items-center space-x-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Chơi lại</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('theory')}
                          type="button"
                          className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 border border-indigo-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition active:scale-95 cursor-pointer flex items-center space-x-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Đọc lý thuyết tiếp</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      {/* Master Character Speaking Grid */}
                      <div className="flex items-center space-x-4">
                        <MasterAvatar />
                        
                        {/* Duolingo styled speech bubble */}
                        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 relative text-left">
                          {/* Callout Arrow */}
                          <div className="absolute left-0 top-1/2 -translate-x-1.5 -translate-y-1.5 w-3 h-3 bg-slate-900 border-l border-b border-slate-800 rotate-45" />
                          
                          <p className="text-xs sm:text-sm text-gray-200 leading-normal font-bold">
                            {currentQ.requirement}
                          </p>
                        </div>
                      </div>

                      {/* Interactive Python Code Editor Box */}
                      <div className={`bg-[#0b0f19] border rounded-xl p-4 sm:p-5 font-mono text-xs sm:text-sm text-left shadow-inner select-none relative overflow-hidden transition-all duration-300 ${
                        wrongShake ? 'animate-shake border-rose-500 shadow-rose-950/25' : 
                        quizStatus === 'correct' ? 'border-emerald-500 shadow-emerald-950/25' : 'border-slate-800'
                      }`}>
                        <span className="absolute top-2 right-3 text-[9px] font-black text-slate-600 tracking-wider uppercase font-sans">python</span>
                        
                        <div className="space-y-3">
                          {currentQ.codeText.split('\n').map((line, lineIdx) => {
                            const parts = line.split(/(\[gap_\d+\])/);
                            return (
                              <div key={lineIdx} className="flex flex-wrap items-center">
                                {/* Line Number */}
                                <span className="text-slate-600 text-right w-6 pr-3 select-none text-[11px] font-bold">{lineIdx + 1}</span>
                                
                                {/* Line content segments */}
                                <div className="flex items-center flex-wrap gap-1">
                                  {parts.map((part, partIdx) => {
                                    const gapMatch = part.match(/^\[gap_(\d+)\]$/);
                                    if (gapMatch) {
                                      const gapId = parseInt(gapMatch[1], 10);
                                      const filledAnswer = selectedAnswers[gapId];
                                      const isActiveSlot = activeSlotId === gapId;
                                      
                                      return (
                                        <button
                                          key={partIdx}
                                          onClick={() => handleClearSlot(gapId)}
                                          type="button"
                                          className={`p-1 px-3 mx-1 rounded-lg text-xs font-black min-w-16 h-8 flex items-center justify-center transition-all border outline-none active:scale-95 select-none cursor-pointer ${
                                            filledAnswer 
                                              ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-extrabold shadow-md' 
                                              : isActiveSlot
                                                ? 'bg-slate-950 border-sky-500/70 text-sky-400 animate-pulse border-2 shadow-inner shadow-sky-950'
                                                : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700'
                                          }`}
                                          title={filledAnswer ? 'Ấn để gỡ từ này!' : 'Ô trống đầu tiên - Chọn một từ phía dưới!'}
                                        >
                                          {filledAnswer || '...'}
                                        </button>
                                      );
                                    } else {
                                      const trimmed = part;
                                      if (trimmed.startsWith('    ')) {
                                        return (
                                          <span key={partIdx} className="whitespace-pre text-gray-300 font-semibold pl-4">
                                            {trimmed.substring(4)}
                                          </span>
                                        );
                                      }
                                      return (
                                        <span key={partIdx} className="text-gray-300 font-semibold whitespace-pre">
                                          {trimmed}
                                        </span>
                                      );
                                    }
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Option bricks/chips inventory */}
                      <div className="space-y-3 text-left">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Chọn gạch mã để lấp đầy ô trống:</p>
                        <div className="flex flex-wrap gap-2.5 p-3 sm:p-4 bg-slate-950/40 rounded-xl border border-slate-900/60 min-h-16 items-center">
                          {currentQ.options.map((option, idx) => {
                            const isUsed = Object.values(selectedAnswers).includes(option);
                            
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => !isUsed && handleSelectOption(option)}
                                disabled={isUsed || quizStatus === 'correct' || quizStatus === 'wrong'}
                                className={`p-2 px-4 rounded-xl text-xs font-black border uppercase tracking-wider transition-all select-none active:scale-95 ${
                                  isUsed 
                                    ? 'bg-slate-900/40 border-slate-900/60 text-slate-700 cursor-not-allowed opacity-40' 
                                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-gray-200 cursor-pointer shadow-md'
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Feedback Section at the bottom */}
                      <div>
                        {quizStatus === 'idle' ? (
                          <button
                            type="button"
                            onClick={handleCheckQuiz}
                            disabled={Object.keys(currentQ.correctAnswers).some(k => !selectedAnswers[parseInt(k, 10)])}
                            className={`w-full py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition shadow-lg select-none cursor-pointer flex items-center justify-center space-x-1.5 border active:scale-98 ${
                              Object.keys(currentQ.correctAnswers).some(k => !selectedAnswers[parseInt(k, 10)])
                                ? 'bg-slate-900 border-slate-850 text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-550 border-indigo-500 text-white shadow-indigo-950/50'
                            }`}
                          >
                            <span>Kiểm tra đáp án</span>
                          </button>
                        ) : quizStatus === 'correct' ? (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-500/15 border border-emerald-500/30 p-4 rounded-xl space-y-3"
                          >
                            <div className="flex items-center space-x-2.5 text-emerald-400">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">✓</span>
                              <span className="text-xs font-extrabold uppercase tracking-wider">Tuyệt vời! Bạn đã ghép đúng cấu trúc! 🎉 +50 XP</span>
                            </div>
                            <p className="text-[11px] text-gray-300 leading-normal text-left sm:pl-7">
                              {currentQ.explanation}
                            </p>
                            
                            <button
                              type="button"
                              onClick={handleNextQuizQuestion}
                              className="w-full py-2.5 bg-emerald-650 hover:bg-emerald-550 border border-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl select-none cursor-pointer flex items-center justify-center space-x-1.5 animate-pulse"
                            >
                              <span>Mục tiếp theo</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ) : quizStatus === 'wrong' ? (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-rose-500/15 border border-rose-500/30 p-4 rounded-xl space-y-3"
                          >
                            <div className="flex items-center space-x-2.5 text-rose-400">
                              <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">✕</span>
                              <span className="text-xs font-extrabold uppercase tracking-wider">Chưa chính xác mất rồi! Bạn mất 1 ❤️</span>
                            </div>
                            <p className="text-[11px] text-gray-300 leading-normal text-left sm:pl-7">
                              Hãy thử hoán đổi hoặc suy luận lại cấu trúc logic Python đúng đắn nhé. Đệ quy hoặc câu điều kiện luôn có thứ tự ưu tiên nhất định.
                            </p>
                            
                            <button
                              type="button"
                              onClick={() => setQuizStatus('idle')}
                              className="w-full py-2.5 bg-rose-650 hover:bg-rose-600 border border-rose-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl select-none cursor-pointer"
                            >
                              Sửa lại đáp án
                            </button>
                          </motion.div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })()}
          </div>
        </main>

        {/* Floating Chatbot Panel & FAB - completely out of main layout flow to not affect dimensions */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              id="chat_companion_sidebar"
              className="fixed bottom-24 right-4 sm:right-6 md:right-8 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[70vh] flex flex-col bg-slate-950/95 border border-indigo-500/25 rounded-2xl shadow-2xl shadow-indigo-950/60 backdrop-blur-md p-4 overflow-hidden text-gray-200 font-sans"
            >
              <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 animate-pulse">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">Trợ lý Algo AI</p>
                    <div className="flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <p className="text-[10px] text-gray-400 leading-none">Phản hồi 24/7</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-gray-400 px-2 py-0.5 rounded select-none">GPT-Gemini-1.5</span>
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(false)}
                    className="p-1 hover:bg-slate-900 rounded-lg text-gray-500 hover:text-white transition cursor-pointer select-none"
                    title="Ẩn cửa sổ Trợ lý AI"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 text-left min-h-0 scrollbar-thin">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col space-y-1 max-w-[85%] ${
                      msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <span className="text-[9px] text-gray-500 px-1">{msg.sender === 'user' ? 'Bạn' : 'Algo AI'} ({msg.timestamp})</span>
                    <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                        : 'bg-slate-900 border border-slate-800 text-gray-300 rounded-tl-none whitespace-pre-wrap'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isLoadingAi && (
                  <div className="flex flex-col space-y-1 mr-auto items-start max-w-[85%]">
                    <span className="text-[9px] text-gray-500 px-1">Algo AI</span>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-tl-none text-xs flex items-center space-x-1.5 text-indigo-400">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-gray-400 text-xs">Đang lập luận...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick recommendations */}
              <div className="mb-4">
                <p className="text-[10px] text-gray-500 uppercase font-semibold text-left mb-2">HỎI AI NHANH:</p>
                <div className="flex flex-wrap gap-1.5 justify-start">
                  {quickPrompts?.map((p, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSendMessage(p)}
                      disabled={isLoadingAi}
                      className="text-[10px] sm:text-[11px] bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-white border border-slate-800 px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer disabled:opacity-50"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Send Box */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputMessage);
                }}
                className="flex space-x-2 relative"
              >
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Giải thích, hỏi đáp lý thuyết..."
                  disabled={isLoadingAi}
                  className="flex-1 bg-slate-900 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500 text-xs md:text-sm text-white rounded-xl px-4 py-3 outline-none disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={isLoadingAi || !inputMessage.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl disabled:opacity-50 select-none cursor-pointer flex items-center justify-center shrink-0 active:scale-95 transition"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button (FAB) for ChatBot */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer select-none border shadow-lg transition-all duration-300 active:scale-95 ${
              isChatOpen
                ? 'bg-rose-600 hover:bg-rose-500 border-rose-500/35 text-white shadow-rose-950/50'
                : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500/35 text-white shadow-indigo-950/50 animate-bounce [animation-duration:3s]'
            }`}
            title={isChatOpen ? 'Đóng Trợ lý AI' : 'Hỏi Trợ lý AI'}
          >
            {isChatOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <div className="relative">
                <MessageSquare className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-indigo-600 animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-indigo-600"></span>
              </div>
            )}
          </button>
        </div>

      </div>

      {/* Interactive Micro Toasts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-6 z-50 bg-indigo-950 border border-indigo-500/30 text-indigo-200 text-xs md:text-sm px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2.5 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Detailed Progress Modal */}
      <AnimatePresence>
        {isProgressModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative"
            >
              <button
                onClick={() => setIsProgressModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                  <Brain className="w-6 h-6 text-indigo-450" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Quản Lý Tiến Độ Khóa Học</h3>
                  <p className="text-xs text-gray-400">Xem chi tiết và tùy chỉnh trạng thái học tập của bạn</p>
                </div>
              </div>

              {/* Progress Bar Info */}
              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-gray-400 font-bold">Tổng hoàn thành khóa học</span>
                    <span className="text-indigo-400 font-mono font-black text-sm">{overallProgressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${overallProgressPercent}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">Đã học xong</p>
                  <p className="text-lg font-black text-emerald-400">{completedLessons} <span className="text-xs text-gray-500 font-normal">/ {totalLessons} bài</span></p>
                </div>
              </div>

              {/* Lesson Progression list check toggles */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin mb-6">
                {syllabus.map((item) => {
                  const diff = item.difficulty || LESSON_DIFFICULTY[item.id] || 'easy';
                  const diffLabel = DIFFICULTY_LABELS[diff];
                  return (
                    <div 
                      key={item.id}
                      className="bg-slate-950/40 hover:bg-slate-950/70 border border-slate-850 p-3 rounded-xl flex items-center justify-between gap-3 transition-colors group"
                    >
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5 mb-1 flex-wrap gap-y-1">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-current/15 ${diffLabel.colorClass}`}>
                            {diffLabel.text}
                          </span>
                          <span className={`text-[9.5px] font-bold ${item.progress === 100 ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {item.progress === 100 ? 'Đã học xong (100%)' : item.progress > 0 ? `Tiến trình: ${item.progress}%` : 'Chưa bắt đầu'}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-white leading-tight truncate">{item.title}</h4>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {/* Selector/Buttons */}
                        {item.progress === 100 ? (
                          <button
                            onClick={() => handleUpdateLessonProgress(item.id, 0)}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 px-2.5 py-1 text-[10px] font-black rounded-lg border border-emerald-500/20 cursor-pointer transition select-none"
                            title="Đánh dấu học lại"
                          >
                            Học Lại
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateLessonProgress(item.id, 100)}
                            className="bg-slate-900 hover:bg-indigo-600 border border-slate-800 hover:border-indigo-500 text-gray-400 hover:text-white px-2.5 py-1 text-[10px] font-black rounded-lg cursor-pointer transition select-none flex items-center space-x-1"
                            title="Đánh dấu hoàn thành"
                          >
                            <span>Hoàn Thành</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsProgressModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-bold text-xs px-4 py-2 rounded-xl border border-slate-700 transition cursor-pointer select-none active:scale-97"
                >
                  Hoàn Tất & Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Course Academic Certificate Modal */}
      <AnimatePresence>
        {isCertificateModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl max-w-2xl w-full p-6 text-left shadow-2xl relative"
            >
              <button
                onClick={() => setIsCertificateModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2.5 mb-5">
                <Award className="w-6 h-6 text-indigo-400 animate-pulse" />
                <div>
                  <h3 className="text-base font-black text-white">Chứng Nhận Học Thuật AlgoLearn</h3>
                  <p className="text-xs text-gray-400">Chứng nhận hoàn thành khóa học Cấu trúc Dữ liệu & Giải thuật</p>
                </div>
              </div>

              {overallProgressPercent === 100 ? (
                /* Unlocked Completed Certificate */
                <div className="space-y-5 text-center">
                  
                  {/* Name field controller to customize */}
                  <div className="text-left bg-slate-950/50 border border-slate-850 p-3 rounded-xl mb-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Họ và Tên Học Viên:</label>
                      <input
                        type="text"
                        value={customCertName}
                        onChange={(e) => setCustomCertName(e.target.value)}
                        placeholder="Nhập tên của bạn..."
                        maxLength={25}
                        className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-gray-200 rounded-lg px-2.5 py-1.5 outline-none font-bold mt-1"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 leading-normal max-w-xs text-right hidden sm:block">
                      * Tên hiển thị trên chứng nhận sẽ cập nhật ngay lập tức. Bạn tự do in hoặc tải về!
                    </p>
                  </div>

                  {/* High Quality Styled Certificate Box */}
                  <div id="print_certificate_view" className="border-4 double border-amber-600 bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-950 p-8 sm:p-12 rounded-xl text-center relative overflow-hidden ring-4 ring-slate-900 shadow-2xl">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />

                    {/* Certificate Crest Layout */}
                    <div className="mx-auto w-12 h-12 rounded-full border-2 border-amber-500 bg-gradient-to-br from-amber-500/20 to-amber-600/35 flex items-center justify-center mb-4">
                      <Trophy className="w-6 h-6 text-amber-400" />
                    </div>

                    <h4 className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Học Viện Công Nghệ & Giải Thuật AlgoLearn</h4>
                    <h2 className="text-xl sm:text-2xl font-black text-amber-500 tracking-tight font-serif mb-6">CHỨNG NHẬN HOÀN THÀNH</h2>
                    
                    <p className="text-xs text-gray-400 italic mb-1.5">Trân trọng trao tặng cho học viên:</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-50 underline decoration-amber-500/50 decoration-2 underline-offset-8 mb-5 tracking-wide uppercase font-serif">
                      {customCertName || 'HỌC VIÊN ALGOLEARN'}
                    </p>

                    <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed mb-8">
                      Vì đã hoàn thành xuất sắc tất cả <strong className="text-emerald-400">7 bài giảng lý thuyết chuyên sâu</strong> và các bài tập thực hành tương tác thuộc chương trình đào tạo cốt lõi <strong>Cấu trúc Dữ liệu & Giải thuật</strong>.
                    </p>

                    {/* Dates & Signatures */}
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-6 text-left max-w-sm mx-auto text-[10px]">
                      <div>
                        <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Ngày Cấp Chứng Nhận:</p>
                        <p className="font-mono text-gray-300 font-bold mt-1">
                          {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500 text-[9px] uppercase font-bold tracking-wider">Xác Nhận Ban Cố Vấn:</p>
                        <p className="text-amber-400 font-extrabold italic text-[11px] mt-1">
                          AlgoLearn Academy
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 gap-3 flex-wrap">
                    <p className="text-xs text-gray-500 italic max-w-xs text-left">
                      💡 Mẹo: Bạn có thể in chứng chỉ này này ra bằng nút "In ngay" bên phải!
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          showToast("📁 Đang chuẩn bị xuất tệp PDF/Ảnh chứng nhận...");
                          setTimeout(() => {
                            showToast("✅ Đã tải xuống chứng nhận thành công!");
                          }, 1500);
                        }}
                        className="bg-slate-800 hover:bg-slate-750 text-gray-200 font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer select-none active:scale-95 border border-slate-700 flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tải Ảnh/PDF</span>
                      </button>
                      <button
                        onClick={() => {
                          showToast("🖨️ Đang phát tập in trình duyệt...");
                          window.print();
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer select-none active:scale-95 flex items-center space-x-1.5 shadow-md shadow-indigo-950/20"
                      >
                        <Printer className="w-3.5 h-3.5 text-white" />
                        <span>In ngay</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Locked Certificate Preview */
                <div className="space-y-6">
                  {/* Warning Box */}
                  <div className="border border-amber-500/25 bg-amber-500/5 p-4 rounded-xl flex items-start space-x-3 text-left">
                    <Lock className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider">CHỨNG NHẬN ĐANG BỊ KHÓA</h4>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">
                        Hiện tại tiến trình của bạn chỉ đạt <strong className="text-indigo-400">{overallProgressPercent}%</strong>.
                        Vui lòng bổ sung hoàn tất toàn diện <strong className="text-white">100% giáo án lý thuyết</strong> (cả 7 bài) để kích hoạt thành công chứng nhận danh giá cấp từ AlgoLearn.
                      </p>
                    </div>
                  </div>

                  {/* Incompleted Syllabus checklist */}
                  <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-xl text-left">
                    <p className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider mb-2.5">Các bài học còn thiếu đề xuất hoàn thiện:</p>
                    <div className="space-y-2">
                      {syllabus.filter(item => item.progress < 100).map(item => {
                        const diff = item.difficulty || LESSON_DIFFICULTY[item.id] || 'easy';
                        const diffLabel = DIFFICULTY_LABELS[diff];
                        return (
                          <div 
                            key={item.id}
                            className="flex items-center justify-between gap-3 text-xs bg-slate-900 border border-slate-850/80 hover:border-slate-820 p-2.5 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className={`text-[8.5px] px-1 py-0.2 rounded font-black border text-center ${diffLabel.colorClass}`}>
                                {diffLabel.text}
                              </span>
                              <span className="font-bold text-gray-300 truncate group-hover:text-indigo-300">{item.title}</span>
                            </div>
                            <button
                              onClick={() => {
                                handleSelectLesson(item.id);
                                setIsCertificateModalOpen(false);
                              }}
                              className="text-[9.5px] bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 px-2 py-1 rounded text-indigo-400 font-black cursor-pointer select-none transition shrink-0"
                            >
                              Học ngay ➔
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Preview certificate option */}
                  <div className="border border-slate-800/80 bg-slate-950/20 p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-start space-x-2.5 text-left">
                      <Unlock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-black text-gray-200">Bạn muốn xem thử chứng chỉ?</h5>
                        <p className="text-[10px] text-gray-500 leading-normal mt-0.5">Mở khóa thử nghiệm tạm thời để kiểm nghiệm định dạng hiển thị thực tế.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleUpdateLessonProgress('1', 100);
                        handleUpdateLessonProgress('2', 100);
                        handleUpdateLessonProgress('3', 100);
                        handleUpdateLessonProgress('4', 100);
                        handleUpdateLessonProgress('5', 100);
                        handleUpdateLessonProgress('6', 100);
                        handleUpdateLessonProgress('7', 100);
                        showToast("✨ Đã mở khóa thử nghiệm chứng chỉ (Hoàn tất 100% bài học)!");
                      }}
                      className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 font-extrabold text-[10.5px] border border-indigo-500/25 px-3 py-1.5 rounded-xl transition cursor-pointer select-none"
                    >
                      Mở khóa thử (Xem thử)
                    </button>
                  </div>

                  <div className="flex justify-end border-t border-slate-850 pt-3">
                    <button
                      onClick={() => setIsCertificateModalOpen(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-bold text-xs px-4 py-2 rounded-xl border border-slate-700 transition cursor-pointer select-none active:scale-97"
                    >
                      Đồng Ý & Tiếp Tục Học
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
