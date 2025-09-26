// Mock Supabase client for demo purposes
// Replace with actual Supabase configuration when ready

const mockStaffData = [
  {
    staff_code: 'BDV001',
    name: 'Nguyễn Văn An',
    title: 'Chuyên viên Tín dụng',
    email: 'nguyen.van.an@bidv.com.vn'
  },
  {
    staff_code: 'BDV002', 
    name: 'Trần Thị Bình',
    title: 'Trưởng phòng Khách hàng doanh nghiệp',
    email: 'tran.thi.binh@bidv.com.vn'
  },
  {
    staff_code: 'BDV003',
    name: 'Lê Minh Cường',
    title: 'Chuyên viên Phân tích rủi ro',
    email: 'le.minh.cuong@bidv.com.vn'
  },
  {
    staff_code: 'BDV004',
    name: 'Phạm Thu Dung',
    title: 'Giám đốc Chi nhánh',
    email: 'pham.thu.dung@bidv.com.vn'
  }
];

// Mock Supabase client
export const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    })
  })
};

// Staff lookup function with mock data
export const fetchStaffByCode = async (staffCode: string) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const staff = mockStaffData.find(s => s.staff_code === staffCode);
    
    if (!staff) {
      return null;
    }

    return staff;
  } catch (error) {
    console.error('Error in fetchStaffByCode:', error);
    return null;
  }
};