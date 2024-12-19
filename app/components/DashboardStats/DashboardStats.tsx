import { Users, BookOpen, Calendar, GraduationCap } from 'lucide-react';

const DashboardStats = () => {
  const stats = [
    {
      name: 'Total Students',
      value: '2,300',
      icon: Users,
      change: '+4.75%',
      changeType: 'increase'
    },
    {
      name: 'Active Classes',
      value: '45',
      icon: Calendar,
      change: '+12.5%',
      changeType: 'increase'
    },
    {
      name: 'Total Courses',
      value: '24',
      icon: BookOpen,
      change: '+2.1%',
      changeType: 'increase'
    },
    {
      name: 'Active Instructors',
      value: '18',
      icon: GraduationCap,
      change: '-0.5%',
      changeType: 'decrease'
    }
  ];

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative bg-white pt-5 px-4 pb-2 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;