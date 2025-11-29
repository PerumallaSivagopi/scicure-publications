import React, { useState } from 'react'
import { fetchAddressTypes } from '../../core/services/addressService'
import { 
  CheckSquare, 
  Users, 
  MessageCircle, 
  DollarSign, 
  Wallet, 
  Clock,
  Umbrella,
  FileText,
  Search,
  Calendar,
  TrendingUp,
  Folder,
  Headphones,
  Plane,
  Award,
  FileSpreadsheet,
  BarChart3,
  Edit3
} from 'lucide-react';

const DashboardPage = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchAddressTypes()
      setData(res)
    } catch (e) {
      setError(e?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }
  const navigationItems = [
  {
    id: 'requests-tasks',
    title: 'Requests & Tasks',
    icon: CheckSquare,
    color: 'bg-green-100',
    iconColor: 'text-green-600',
    notification: true,
    path: '/requests'
  },
  {
    id: 'employees',
    title: 'Employees',
    icon: Users,
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
    path: '/employees'
  },
  {
    id: 'vibe',
    title: 'Vibe',
    icon: MessageCircle,
    color: 'bg-purple-100',
    iconColor: 'text-purple-600',
    path: '/vibe'
  },
  {
    id: 'reimbursement',
    title: 'Reimbursement',
    icon: DollarSign,
    color: 'bg-green-100',
    iconColor: 'text-green-600',
    path: '/reimbursement'
  },
  {
    id: 'compensation',
    title: 'Compensation',
    icon: Wallet,
    color: 'bg-green-100',
    iconColor: 'text-green-600',
    path: '/compensation'
  },
  {
    id: 'attendance',
    title: 'Attendance',
    icon: Clock,
    color: 'bg-red-100',
    iconColor: 'text-red-600',
    path: '/attendance'
  },
  {
    id: 'leave',
    title: 'Leave',
    icon: Umbrella,
    color: 'bg-red-100',
    iconColor: 'text-red-600',
    path: '/leave'
  },
  {
    id: 'hr-documents',
    title: 'HR Documents',
    icon: FileText,
    color: 'bg-gray-100',
    iconColor: 'text-gray-600',
    path: '/hr-documents'
  },
  {
    id: 'recruitment',
    title: 'Recruitment',
    icon: Search,
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
    path: '/recruitment'
  },
  {
    id: 'calendar',
    title: 'Calendar',
    icon: Calendar,
    color: 'bg-red-100',
    iconColor: 'text-red-600',
    path: '/calendar'
  },
  {
    id: 'performance',
    title: 'Performance',
    icon: TrendingUp,
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
    path: '/performance'
  },
  {
    id: 'project',
    title: 'Project',
    icon: Folder,
    color: 'bg-teal-100',
    iconColor: 'text-teal-600',
    path: '/project'
  },
  {
    id: 'helpdesk',
    title: 'Helpdesk',
    icon: Headphones,
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
    path: '/helpdesk'
  },
  {
    id: 'travel',
    title: 'Travel',
    icon: Plane,
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
    path: '/travel'
  },
  {
    id: 'recognition',
    title: 'Recognition',
    icon: Award,
    color: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    path: '/recognition'
  },
  {
    id: 'time-sheets',
    title: 'Time Sheets',
    icon: FileSpreadsheet,
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
    path: '/time-sheets'
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: BarChart3,
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
    path: '/reports'
  },
  {
    id: 'reports-builder',
    title: 'Reports Builder',
    icon: Edit3,
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
    path: '/reports-builder'
  }
];

  return (
    <div className="p-4 sm:p-6">
  {/* Welcome Header */}
  <h2 className="text-xl sm:text-2xl font-semibold mb-6">
    Welcome Back <span className="italic text-primary">Admin</span>
  </h2>

  <div className="min-h-screen bg-gray-50 rounded-xl p-4 sm:p-6">
    {/* Navigation Cards Grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
      {navigationItems.map((item) => {
        const IconComponent = item.icon;

        return (
          <div
            key={item.id}
            className="relative bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 
                       transition-all cursor-pointer p-4 sm:p-6 flex flex-col items-center text-center hover:-translate-y-1"
          >
            {/* Notification Badge */}
            {item.notification && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            )}

            {/* Icon Wrapper */}
            <div
              className={`${item.color} p-3 sm:p-4 rounded-lg mb-3 
                          flex items-center justify-center group-hover:scale-110 transition-transform`}
            >
              <IconComponent className={`w-6 h-6 sm:w-8 sm:h-8 ${item.iconColor}`} />
            </div>

            {/* Card Title */}
            <h3 className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">
              {item.title}
            </h3>
          </div>
        );
      })}
    </div>
  </div>
</div>

    
  )
}

export default DashboardPage