export const mockDocuments = [
  { id: 1, name: 'Employee Handbook 2024', department: 'HR', uploadDate: '2024-01-15', pages: 48, accessLevel: 'All', tags: ['policy', 'hr'], size: '2.4 MB', type: 'pdf', uploadedBy: 'Sara Williams', summary: 'Comprehensive guide covering company culture, policies, and procedures for all employees.' },
  { id: 2, name: 'Sales Contract Template', department: 'Legal', uploadDate: '2024-02-20', pages: 12, accessLevel: 'Manager', tags: ['legal', 'sales'], size: '540 KB', type: 'docx', uploadedBy: 'Alex Morgan', summary: 'Standard contract template for client engagements and sales agreements.' },
  { id: 3, name: 'Q1 Financial Report', department: 'Finance', uploadDate: '2024-03-01', pages: 32, accessLevel: 'Admin', tags: ['finance', 'report'], size: '1.8 MB', type: 'pdf', uploadedBy: 'Alex Morgan', summary: 'Quarterly financial performance overview including revenue, expenses, and projections.' },
  { id: 4, name: 'Leave Policy Guidelines', department: 'HR', uploadDate: '2024-01-22', pages: 8, accessLevel: 'All', tags: ['policy', 'leave'], size: '320 KB', type: 'pdf', uploadedBy: 'Sara Williams', summary: 'Detailed leave entitlements, approval process, and types of leave available.' },
  { id: 5, name: 'IT Security Policy', department: 'Engineering', uploadDate: '2024-02-10', pages: 20, accessLevel: 'All', tags: ['security', 'it'], size: '890 KB', type: 'pdf', uploadedBy: 'Alex Morgan', summary: 'Security standards and protocols for all company systems and data handling.' },
  { id: 6, name: 'Product Roadmap 2024', department: 'Engineering', uploadDate: '2024-03-05', pages: 16, accessLevel: 'Manager', tags: ['product', 'roadmap'], size: '1.2 MB', type: 'pptx', uploadedBy: 'Alex Morgan', summary: 'Strategic product development plan and milestones for the fiscal year.' },
  { id: 7, name: 'Reimbursement Policy', department: 'Finance', uploadDate: '2024-01-30', pages: 6, accessLevel: 'All', tags: ['finance', 'policy'], size: '280 KB', type: 'pdf', uploadedBy: 'Sara Williams', summary: 'Expense reimbursement procedures, eligible expenses, and submission process.' },
  { id: 8, name: 'Onboarding Checklist', department: 'HR', uploadDate: '2024-02-14', pages: 4, accessLevel: 'All', tags: ['onboarding', 'hr'], size: '150 KB', type: 'docx', uploadedBy: 'Sara Williams', summary: 'Step-by-step checklist for new employee onboarding and orientation.' },
  { id: 9, name: 'Legal Compliance 2024', department: 'Legal', uploadDate: '2024-03-10', pages: 28, accessLevel: 'Admin', tags: ['legal', 'compliance'], size: '2.1 MB', type: 'pdf', uploadedBy: 'Alex Morgan', summary: 'Annual compliance requirements and regulatory updates for the organization.' },
  { id: 10, name: 'Sales Playbook Q2', department: 'Sales', uploadDate: '2024-03-15', pages: 22, accessLevel: 'Manager', tags: ['sales', 'strategy'], size: '1.5 MB', type: 'pdf', uploadedBy: 'John Davis', summary: 'Sales strategies, scripts, and best practices for Q2 targets.' },
]

export const mockUsers = [
  { id: 1, name: 'Alex Morgan', email: 'admin@intellidocs.com', role: 'admin', department: 'Engineering', status: 'active', lastActive: '2 mins ago', avatar: 'AM' },
  { id: 2, name: 'Sara Williams', email: 'manager@intellidocs.com', role: 'manager', department: 'HR', status: 'active', lastActive: '1 hour ago', avatar: 'SW' },
  { id: 3, name: 'John Davis', email: 'employee@intellidocs.com', role: 'employee', department: 'Sales', status: 'active', lastActive: '3 hours ago', avatar: 'JD' },
  { id: 4, name: 'Emily Chen', email: 'emily@company.com', role: 'employee', department: 'Finance', status: 'active', lastActive: '1 day ago', avatar: 'EC' },
  { id: 5, name: 'Michael Park', email: 'michael@company.com', role: 'manager', department: 'Legal', status: 'inactive', lastActive: '3 days ago', avatar: 'MP' },
  { id: 6, name: 'Priya Sharma', email: 'priya@company.com', role: 'employee', department: 'Engineering', status: 'active', lastActive: '5 hours ago', avatar: 'PS' },
]

export const mockDepartments = [
  { id: 1, name: 'HR', documents: 24, users: 8, searches: 342, color: 'bg-purple-500', icon: '👥' },
  { id: 2, name: 'Finance', documents: 18, users: 6, searches: 215, color: 'bg-green-500', icon: '💰' },
  { id: 3, name: 'Legal', documents: 31, users: 4, searches: 189, color: 'bg-red-500', icon: '⚖️' },
  { id: 4, name: 'Operations', documents: 15, users: 12, searches: 276, color: 'bg-orange-500', icon: '⚙️' },
  { id: 5, name: 'Sales', documents: 22, users: 15, searches: 418, color: 'bg-blue-500', icon: '📈' },
  { id: 6, name: 'Engineering', documents: 28, users: 10, searches: 502, color: 'bg-cyan-500', icon: '🛠️' },
]

export const searchTrendsData = [
  { name: 'Mon', searches: 65 }, { name: 'Tue', searches: 88 }, { name: 'Wed', searches: 72 },
  { name: 'Thu', searches: 95 }, { name: 'Fri', searches: 110 }, { name: 'Sat', searches: 42 }, { name: 'Sun', searches: 38 },
]

export const monthlyData = [
  { name: 'Jan', searches: 820, documents: 45 }, { name: 'Feb', searches: 932, documents: 62 },
  { name: 'Mar', searches: 1100, documents: 78 }, { name: 'Apr', searches: 985, documents: 55 },
  { name: 'May', searches: 1240, documents: 90 }, { name: 'Jun', searches: 1380, documents: 102 },
]

export const departmentUsageData = [
  { name: 'Engineering', value: 502 }, { name: 'Sales', value: 418 },
  { name: 'HR', value: 342 }, { name: 'Operations', value: 276 },
  { name: 'Finance', value: 215 }, { name: 'Legal', value: 189 },
]

export const mockActivity = [
  { id: 1, user: 'Sara Williams', action: 'uploaded', target: 'Leave Policy Guidelines', time: '5 mins ago', icon: 'upload' },
  { id: 2, user: 'John Davis', action: 'searched', target: 'notice period policy', time: '12 mins ago', icon: 'search' },
  { id: 3, user: 'Alex Morgan', action: 'added user', target: 'Priya Sharma', time: '1 hour ago', icon: 'user' },
  { id: 4, user: 'Emily Chen', action: 'viewed', target: 'Q1 Financial Report', time: '2 hours ago', icon: 'eye' },
  { id: 5, user: 'Michael Park', action: 'uploaded', target: 'Legal Compliance 2024', time: '3 hours ago', icon: 'upload' },
]

export const suggestedQuestions = [
  'What is the notice period?',
  'What are the termination conditions?',
  'How many annual leaves are allowed?',
  'What is the reimbursement policy?',
  'What is the work from home policy?',
  'How do I submit an expense claim?',
]

export const mockConversations = [
  {
    id: 1,
    role: 'user',
    content: 'What is the notice period for resigning from the company?',
  },
  {
    id: 2,
    role: 'assistant',
    content: 'Based on the Employee Handbook 2024, the standard notice period for resignation is **30 days** for regular employees and **60 days** for managerial positions. However, this may vary based on your employment contract. The notice should be submitted in writing to your direct manager and HR department.',
    sources: [
      { name: 'Employee Handbook 2024', department: 'HR', page: 12, confidence: 97 },
      { name: 'Employment Terms Policy', department: 'Legal', page: 4, confidence: 89 },
    ],
  },
]
