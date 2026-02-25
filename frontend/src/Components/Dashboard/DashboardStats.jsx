import React, { useState, useEffect, useContext } from 'react';
import Axios from '../../Api/Axios';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { UserContext } from '../../Context/UserContext';
import { Table, Input, Select, Space, Button, Card, Row, Col, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
const { Title } = Typography;

const DashboardStats = () => {
  const [dashboardData, setDashboardData] = useState({
    statistics: {
      statusDistribution: {}, 
      registrationTrends: [],
      topSelectors: [],
      totalUsers: 0,
      totalEvents: 0,
      giftsCollected: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const { user } = useContext(UserContext);
  
  // Users table states
  const [usersData, setUsersData] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    company: '',
    slot: '',
    status: '',
    sortBy: 'desc',
  });
  const [companyOptions, setCompanyOptions] = useState([]);
  const [slotOptions, setSlotOptions] = useState([]);
  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
  ];
  
  // Modified state for single select
  const [eventOptions, setEventOptions] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [eventsLoading, setEventsLoading] = useState(false);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  useEffect(() => {
    fetchEventOptions();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, selectedEvent]);

  useEffect(() => {
    if (selectedEvent) {
      fetchUsersData();
      fetchFilterOptions();
    }
  }, [timeRange, selectedEvent, filters, pagination.current]);

  const fetchEventOptions = async () => {
    try {
      setEventsLoading(true);
      const response = await Axios.get('/events/event-list');
      if (response.data.success) {
        const options = response.data.data.map(event => ({
          value: event.id,
          label: event.title
        }));
        setEventOptions(options);
        // Only auto-select first event if none is selected and list is not empty
        if (!selectedEvent && options.length > 0) {
          setSelectedEvent(options[0].value);
        }
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if((user.role !== "admin") && (!selectedEvent)){
        return;
      }
      
      // Build params object
      const params = {};
      
      // Add time range if not 'all'
      if (timeRange !== 'all') {
        params.timeRange = timeRange;
      }
      
      // Add event ID if selected
      if (selectedEvent) {
        params.eventId = selectedEvent;
      }
      
      const response = await Axios.get('/dashboard', { params });
      setDashboardData(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventChange = (e) => {
    setSelectedEvent(e.target.value);
    setPagination({ ...pagination, current: 1 });
    setFilters({
      company: '',
      slot: '',
      status: '',
      sortBy: 'desc',
    });
  };

  const fetchFilterOptions = async () => {
    if (!selectedEvent) return;
    
    try {
      // Fetch unique companies
      const companiesRes = await Axios.get(`/dashboard/companies/${selectedEvent}`);
      if (companiesRes.data.success) {
        setCompanyOptions(companiesRes.data.data.map(company => ({
          value: company,
          label: company
        })));
      }
      
      // Fetch unique time slots
      const slotsRes = await Axios.get(`/dashboard/slots/${selectedEvent}`);
      if (slotsRes.data.success) {
        setSlotOptions(slotsRes.data.data.map(slot => ({
          value: slot,
          label: slot
        })));
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchUsersData = async () => {
    if (!selectedEvent) {
      console.log('No event selected, skipping fetch');
      return;
    }
    
    try {
      console.log('Fetching users with filters:', { 
        eventId: selectedEvent, 
        ...filters, 
        page: pagination.current, 
        limit: pagination.pageSize 
      });
      
      setUsersLoading(true);
      const response = await Axios.post(`/dashboard/users-slot/${selectedEvent}`, {
        ...filters,
        page: pagination.current,
        limit: pagination.pageSize,
      });
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        console.log('Setting users data:', response.data.users);
        setUsersData(response.data.users || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching users data:', error);
      setUsersData([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
      }));
    } finally {
      setUsersLoading(false);
    }
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    });
    setPagination({ ...pagination, current: 1 });
  };

  const handleResetFilters = () => {
    setFilters({
      company: '',
      slot: '',
      status: '',
      sortBy: 'desc',
    });
    setPagination({ ...pagination, current: 1 });
  };


  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.firstName || ''} ${record.lastName || ''}`.trim(),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Company',
      key: 'company',
      render: (_, record) => record.slots?.company || '-',
    },
    {
      title: 'Time Slot',
      key: 'timeSlot',
      render: (_, record) => record.slots?.timeSlot || '-',
    },
    {
      title: 'Status',
      key: 'status',
      sorter: true,
      render: (_, record) => {
        const isCompleted = record.slots?.completed;
        const statusText = isCompleted ? 'completed' : 'pending';
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${
            isCompleted 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
          </span>
        );
      },
    },
    {
      title: 'Registration Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Select an event</div>
      </div>
    );
  }

  const { statistics } = dashboardData;

  // Prepare data for charts
  const companyChartData = statistics?.topCompanies?.map((company, index) => ({
    name: company._id,
    value: company.count,
    fill: COLORS[index % COLORS.length]
  }));

  const statusChartData = Object.entries(statistics?.statusDistribution || {})?.map(([status, count], index) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    fill: COLORS[index % COLORS.length]
  }));

  const pieChartData = statusChartData.map((entry, index) => ({
    ...entry,
    fill: COLORS[index % COLORS.length]
  }));
console.log("user data is ",usersData);

  return (
    <div className="p-3 sm:p-4 lg:p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Analytics</h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>

          {/* Event Single Select */}
          <select
            value={selectedEvent}
            onChange={handleEventChange}
            disabled={eventsLoading}
            className="w-full sm:min-w-[250px] lg:min-w-[300px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
          >
            {eventOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Event Display */}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Users</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{statistics?.totalUsers}</p>
            </div>
          </div>
        </div>

      {!selectedEvent&&<div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600 flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div className="ml-3 sm:ml-4 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Events</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{statistics?.totalEvents}</p>
          </div>
        </div>
      </div>}

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Gifts Collected</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{statistics?.giftsCollected}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-4 mb-6 sm:mb-8"> 
        <div className="bg-white p-4 sm:p-6 lg:col-span-3 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Users Status</h3>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchUsersData}
              loading={usersLoading}
              size="small"
            >
              Refresh
            </Button>
          </div>
          
          {/* Filters */}
          <div className="mb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <Input
                  placeholder="Search by name/email"
                  prefix={<SearchOutlined />}
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  allowClear
                  size="small"
                />
              <Select
                placeholder="Company"
                className="w-full"
                value={filters.company || undefined}
                onChange={(value) => handleFilterChange('company', value)}
                options={companyOptions}
                allowClear
                size="small"
              />
              <Select
                placeholder="Status"
                className="w-full"
                value={filters.status || undefined}
                onChange={(value) => handleFilterChange('status', value)}
                options={statusOptions}
                allowClear
                size="small"
              />
              <Select
                placeholder="Time Slot"
                className="w-full"
                value={filters.slot || undefined}
                onChange={(value) => handleFilterChange('slot', value)}
                options={slotOptions}
                allowClear
                size="small"
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleResetFilters}
                disabled={!filters.company && !filters.status && !filters.search && !filters.slot}
                size="small"
              >
                Reset Filters
              </Button>
            </div>
          </div>
          
          {/* Users Table */}
          <div className="overflow-x-auto">
            {!usersLoading && (!usersData || usersData.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                No data available
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={usersData || []}
                rowKey="_id"
                loading={usersLoading}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
                }}
                onChange={handleTableChange}
                scroll={{ x: true }}
                size="small"
                locale={{
                  emptyText: 'No data available'
                }}
              />
            )}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 lg:col-span-2 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Status Overview</h3>
          <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px]">
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          {statusChartData.map((entry, index) => (
            <div key={`cell-${index}`} className="flex items-center justify-center">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }}></div>
              <span className="ml-2">{entry.name}: <span className="font-bold">{entry.value}</span></span>
            </div>
          ))}
        </div>
      </div> 

   
    </div>
  );
};

export default DashboardStats;