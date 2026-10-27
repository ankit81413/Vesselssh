'use client'

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity,
  Search,
  MoreVertical,
  Cpu,
  HardDrive,
  Users,
  Server,
  FileText,
  Play,
  Square,
  X,
  Copy,
  Check,
  Download,
  Info,
  Sliders,
  Pause,
  Trash2,
  CheckCircle2,
  XCircle,
  Zap,
  Columns
} from 'lucide-react';

// ==========================================
// MOCK DATA GENERATOR FOR LINUX SYSTEM
// ==========================================

type Tab = 'processes' | 'stats' | 'users' | 'services' | 'logs';
type SortOrder = 'asc' | 'desc';
type LogSeverity = 'INFO' | 'WARN' | 'ERROR';

interface Process {
  pid: number;
  ppid: number;
  user: string;
  cpu: number;
  mem: number;
  res: string;
  virt: string;
  shr: string;
  s: string;
  pri: number;
  ni: number;
  threads: number;
  time: string;
  startTime: string;
  command: string;
}

interface LogEntry {
  id: number;
  timestamp: string;
  severity: LogSeverity;
  source: string;
  message: string;
}

interface ConfirmationDialog {
  title: string;
  message: string;
  onConfirm: () => void;
}

type VisibleColumns = {
  ppid: boolean;
  pri: boolean;
  ni: boolean;
  virt: boolean;
  shr: boolean;
  time: boolean;
  threads: boolean;
};

const INITIAL_PROCESSES: Process[] = [
  { pid: 1, ppid: 0, user: 'root', cpu: 0.1, mem: 0.4, res: '12.4M', virt: '168M', shr: '8.2M', s: 'S', pri: 20, ni: 0, threads: 1, time: '01:23.45', startTime: '08:00', command: '/sbin/init splash' },
  { pid: 482, ppid: 1, user: 'root', cpu: 0.0, mem: 0.2, res: '6.8M', virt: '84M', shr: '4.1M', s: 'S', pri: 20, ni: 0, threads: 2, time: '00:12.10', startTime: '08:00', command: '/lib/systemd/systemd-journald' },
  { pid: 1042, ppid: 1, user: 'www-data', cpu: 1.8, mem: 2.1, res: '64.2M', virt: '412M', shr: '18.5M', s: 'S', pri: 20, ni: 0, threads: 4, time: '14:02.88', startTime: '08:02', command: 'nginx: worker process' },
  { pid: 1043, ppid: 1, user: 'www-data', cpu: 1.5, mem: 1.9, res: '58.7M', virt: '412M', shr: '18.1M', s: 'S', pri: 20, ni: 0, threads: 4, time: '11:45.12', startTime: '08:02', command: 'nginx: worker process' },
  { pid: 2190, ppid: 1, user: 'vessel', cpu: 24.6, mem: 6.8, res: '215.4M', virt: '1.4G', shr: '42.0M', s: 'R', pri: 20, ni: 0, threads: 18, time: '48:19.04', startTime: '08:15', command: 'node /app/server/index.js --production' },
  { pid: 2311, ppid: 2190, user: 'vessel', cpu: 12.2, mem: 3.4, res: '108.1M', virt: '890M', shr: '24.2M', s: 'R', pri: 20, ni: 0, threads: 8, time: '22:04.11', startTime: '08:16', command: 'node /app/workers/thumbnail-generator.js' },
  { pid: 3104, ppid: 1, user: 'postgres', cpu: 3.4, mem: 8.2, res: '260.8M', virt: '1.8G', shr: '112M', s: 'S', pri: 20, ni: 0, threads: 12, time: '36:40.92', startTime: '08:05', command: 'postgres: main pool writer' },
  { pid: 3108, ppid: 3104, user: 'postgres', cpu: 0.8, mem: 2.5, res: '79.2M', virt: '1.8G', shr: '48M', s: 'S', pri: 20, ni: 0, threads: 1, time: '04:12.33', startTime: '08:05', command: 'postgres: autovacuum launcher' },
  { pid: 4120, ppid: 1, user: 'redis', cpu: 0.4, mem: 1.2, res: '38.4M', virt: '150M', shr: '12M', s: 'S', pri: 20, ni: 0, threads: 4, time: '02:18.01', startTime: '08:06', command: 'redis-server 127.0.0.1:6379' },
  { pid: 5012, ppid: 1, user: 'root', cpu: 0.0, mem: 0.5, res: '16.1M', virt: '110M', shr: '9.0M', s: 'S', pri: 20, ni: 0, threads: 1, time: '00:04.80', startTime: '08:10', command: '/usr/sbin/sshd -D' },
  { pid: 5892, ppid: 5012, user: 'deploy', cpu: 0.2, mem: 0.7, res: '22.4M', virt: '135M', shr: '11M', s: 'S', pri: 20, ni: 0, threads: 1, time: '00:15.62', startTime: '09:40', command: 'sshd: deploy@pts/0' },
  { pid: 5895, ppid: 5892, user: 'deploy', cpu: 0.0, mem: 0.3, res: '9.8M', virt: '24M', shr: '5.2M', s: 'S', pri: 20, ni: 0, threads: 1, time: '00:01.44', startTime: '09:40', command: '-bash' },
  { pid: 6420, ppid: 5895, user: 'deploy', cpu: 4.2, mem: 0.9, res: '28.5M', virt: '85M', shr: '14M', s: 'R', pri: 20, ni: 0, threads: 1, time: '00:08.90', startTime: '10:12', command: 'htop' },
  { pid: 7100, ppid: 1, user: 'vector', cpu: 1.1, mem: 1.5, res: '47.2M', virt: '320M', shr: '16M', s: 'S', pri: 20, ni: 0, threads: 6, time: '08:44.20', startTime: '08:03', command: '/usr/bin/vector --config /etc/vector/vector.yaml' },
  { pid: 8214, ppid: 1, user: 'docker', cpu: 2.7, mem: 4.1, res: '130.2M', virt: '940M', shr: '32M', s: 'S', pri: 20, ni: 0, threads: 24, time: '19:30.15', startTime: '08:04', command: 'dockerd -H unix:///var/run/docker.sock' }
];

const MOCK_USERS = [
  { user: 'root', uid: 0, processes: 8, cpu: 0.4, memory: '242.4 MB', memPct: 3.1 },
  { user: 'vessel', uid: 1000, processes: 14, cpu: 36.8, memory: '1.2 GB', memPct: 15.4 },
  { user: 'www-data', uid: 33, processes: 4, cpu: 3.3, memory: '210.8 MB', memPct: 2.7 },
  { user: 'postgres', uid: 105, processes: 6, cpu: 4.2, memory: '480.0 MB', memPct: 6.1 },
  { user: 'redis', uid: 109, processes: 1, cpu: 0.4, memory: '38.4 MB', memPct: 0.5 },
  { user: 'deploy', uid: 1001, processes: 3, cpu: 4.4, memory: '60.7 MB', memPct: 0.8 },
  { user: 'vector', uid: 112, processes: 1, cpu: 1.1, memory: '47.2 MB', memPct: 0.6 }
];

const MOCK_SERVICES = [
  { service: 'nginx.service', status: 'Running', startup: 'enabled', pid: 1042, description: 'A high performance web server and a reverse proxy server' },
  { service: 'ssh.service', status: 'Running', startup: 'enabled', pid: 5012, description: 'OpenBSD Secure Shell server daemon' },
  { service: 'cron.service', status: 'Running', startup: 'enabled', pid: 612, description: 'Regular background program processing daemon' },
  { service: 'postgresql.service', status: 'Running', startup: 'enabled', pid: 3104, description: 'PostgreSQL RDBMS engine' },
  { service: 'redis-server.service', status: 'Running', startup: 'enabled', pid: 4120, description: 'Advanced key-value store database' },
  { service: 'docker.service', status: 'Running', startup: 'enabled', pid: 8214, description: 'Docker Application Container Engine' },
  { service: 'uwsgi.service', status: 'Stopped', startup: 'disabled', pid: '-', description: 'uWSGI application server container' },
  { service: 'fail2ban.service', status: 'Failed', startup: 'enabled', pid: '-', description: 'Ban hosts that cause multiple authentication errors' },
  { service: 'vector.service', status: 'Running', startup: 'enabled', pid: 7100, description: 'High-performance observability data pipeline' },
  { service: 'k3s.service', status: 'Stopped', startup: 'manual', pid: '-', description: 'Lightweight Kubernetes cluster daemon' }
];

const MOCK_LOG_ENTRIES: LogEntry[] = [
  { id: 1, timestamp: '10:14:02.102', severity: 'INFO', source: 'systemd', message: 'Started Process Manager Daemon service worker #4.' },
  { id: 2, timestamp: '10:14:03.415', severity: 'INFO', source: 'nginx', message: '192.168.1.45 - - [27/Oct/2026:10:14:03 +0000] "GET /api/v1/status HTTP/1.1" 200 482' },
  { id: 3, timestamp: '10:14:05.890', severity: 'WARN', source: 'kernel', message: '[18492.12] TCP: Possible SYN flooding on port 443. Sending cookies.' },
  { id: 4, timestamp: '10:14:08.112', severity: 'INFO', source: 'postgres', message: 'LOG: checkpoint starting: time' },
  { id: 5, timestamp: '10:14:09.301', severity: 'ERROR', source: 'fail2ban', message: 'ERROR [sshd] Failed to inspect /var/log/auth.log: Permission denied' },
  { id: 6, timestamp: '10:14:11.554', severity: 'INFO', source: 'node/app', message: 'HTTP Server listening on 0.0.0.0:3000 (worker PID 2190)' },
  { id: 7, timestamp: '10:14:14.002', severity: 'WARN', source: 'docker', message: 'Container c8f920a1 is exceeding memory threshold limits (88% allocated)' },
  { id: 8, timestamp: '10:14:16.873', severity: 'INFO', source: 'postgres', message: 'LOG: checkpoint complete: wrote 412 buffers (2.5%); 0 WAL file(s) added' },
  { id: 9, timestamp: '10:14:18.220', severity: 'ERROR', source: 'vector', message: 'Sink output "elasticsearch_logs" failed: Connection reset by peer' },
  { id: 10, timestamp: '10:14:20.005', severity: 'INFO', source: 'sshd', message: 'Accepted publickey for deploy from 10.0.4.12 port 52311 ssh2' }
];

// Generate history array for sparklines
const generateHistory = (points = 24, min = 10, max = 90) => {
  return Array.from({ length: points }, () => Math.floor(Math.random() * (max - min + 1)) + min);
};

const escapeCsvField = (value: string | number) => {
  const text = String(value).replace(/"/g, '""');
  // Prevent spreadsheet applications from evaluating values as formulas.
  const safeText = /^[\t\r\n ]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText}"`;
};

const downloadFile = (content: string, type: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function App() {
  // State: Tab & Navigation
  const [activeTab, setActiveTab] = useState<Tab>('processes');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State: Processes
  const [processes, setProcesses] = useState(INITIAL_PROCESSES);
  const [selectedPid, setSelectedPid] = useState<number | null>(2190);
  const [sortField, setSortField] = useState<keyof Process>('cpu');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [userFilter, setUserFilter] = useState<string | null>(null);

  // State: Users & Services
  const [selectedService, setSelectedService] = useState(MOCK_SERVICES[0]);

  // State: Logs
  const [logs, setLogs] = useState(MOCK_LOG_ENTRIES);
  const [logSeverityFilter, setLogSeverityFilter] = useState('ALL');
  const [isLogPaused, setIsLogPaused] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // State: Settings & 3-Dot Menu Dropdown
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(2); // seconds
  const [rowDensity, setRowDensity] = useState('comfortable'); // 'compact' | 'comfortable'
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog | null>(null);
  
  // Optional columns state for Processes table
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    ppid: true,
    pri: false,
    ni: false,
    virt: true,
    shr: false,
    time: false,
    threads: true
  });

  // Simulated live metrics history
  const [cpuHistory, setCpuHistory] = useState(() => generateHistory(30, 15, 60));
  const [memHistory, setMemHistory] = useState(() => generateHistory(30, 40, 50));
  
  const [perCoreStats] = useState(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      usage: Math.floor(Math.random() * 45) + 5,
      history: generateHistory(16, 5, 85)
    }))
  );

  // Simulated live refresh ticker
  useEffect(() => {
    if (refreshInterval === 0) return;
    const timer = setInterval(() => {
      // Small jitter for process cpu usage
      setProcesses(prev => 
        prev.map(p => {
          if (p.s === 'R') {
            const delta = (Math.random() - 0.48) * 2;
            const newCpu = Math.max(0.1, Math.min(99.9, +(p.cpu + delta).toFixed(1)));
            return { ...p, cpu: newCpu };
          }
          return p;
        })
      );

      // Add live stat points
      setCpuHistory(prev => [...prev.slice(1), Math.floor(Math.random() * 40) + 15]);
      setMemHistory(prev => [...prev.slice(1), 48 + Math.floor(Math.random() * 3)]);

      // Push random log entry if log streaming active
      if (!isLogPaused) {
        const timeStr = new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 900 + 100);
        const severities: LogSeverity[] = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR'];
        const sev = severities[Math.floor(Math.random() * severities.length)];
        const sources = ['nginx', 'node/app', 'kernel', 'sshd', 'postgres'];
        const src = sources[Math.floor(Math.random() * sources.length)];
        
        const newEntry: LogEntry = {
          id: Date.now(),
          timestamp: timeStr,
          severity: sev,
          source: src,
          message: `Stream event trace logged for process node daemon [worker #${Math.floor(Math.random() * 4 + 1)}]`
        };

        setLogs(prev => [...prev.slice(-49), newEntry]);
      }
    }, refreshInterval * 1000);

    return () => clearInterval(timer);
  }, [refreshInterval, isLogPaused]);

  // Handle clicking outside 3-dot menu
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Filtered processes based on search query, user filter
  const filteredProcesses = useMemo(() => {
    return processes
      .filter(p => {
        if (userFilter && p.user !== userFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.pid.toString().includes(q) ||
          p.user.toLowerCase().includes(q) ||
          p.command.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [processes, searchQuery, userFilter, sortField, sortOrder]);

  const selectedProcessObj = useMemo(() => {
    return selectedPid === null ? undefined : processes.find(p => p.pid === selectedPid);
  }, [processes, selectedPid]);

  const handleSort = (field: keyof Process) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Switch to processes view filtered by user
  const handleViewUserProcesses = (username: string) => {
    setUserFilter(username);
    setActiveTab('processes');
  };

  // Export handlers
  const handleExportCSV = () => {
    const rows: Array<Array<string | number>> = [];
    if (activeTab === 'processes') {
      rows.push(['PID', 'USER', 'CPU', 'MEM', 'VIRT', 'RES', 'STATE', 'COMMAND']);
      filteredProcesses.forEach(p => rows.push([p.pid, p.user, p.cpu, p.mem, p.virt, p.res, p.s, p.command]));
    } else if (activeTab === 'users') {
      rows.push(['USER', 'UID', 'PROCESSES', 'CPU', 'MEMORY', 'MEM_PCT']);
      MOCK_USERS.forEach(u => rows.push([u.user, u.uid, u.processes, u.cpu, u.memory, u.memPct]));
    } else if (activeTab === 'services') {
      rows.push(['SERVICE', 'STATUS', 'STARTUP', 'PID', 'DESCRIPTION']);
      MOCK_SERVICES.forEach(s => rows.push([s.service, s.status, s.startup, s.pid, s.description]));
    } else {
      rows.push(['TIMESTAMP', 'SEVERITY', 'SOURCE', 'MESSAGE']);
      logs.forEach(l => rows.push([l.timestamp, l.severity, l.source, l.message]));
    }
    const csvContent = rows.map(row => row.map(escapeCsvField).join(',')).join('\r\n');
    downloadFile(csvContent, 'text/csv;charset=utf-8', `vesselssh-${activeTab}-export.csv`);
  };

  const handleExportJSON = () => {
    let data: unknown[] = [];
    if (activeTab === 'processes') data = filteredProcesses;
    else if (activeTab === 'users') data = MOCK_USERS;
    else if (activeTab === 'services') data = MOCK_SERVICES;
    else data = logs;

    downloadFile(JSON.stringify(data, null, 2), 'application/json;charset=utf-8', `vesselssh-${activeTab}-export.json`);
  };

  // Mock Process Actions
  const handleKillProcess = (pid: number, force = false) => {
    setConfirmDialog({
      title: force ? 'Force Kill Process?' : 'Terminate Process?',
      message: `Are you sure you want to send ${force ? 'SIGKILL (9)' : 'SIGTERM (15)'} to process PID ${pid}?`,
      onConfirm: () => {
        setProcesses(prev => prev.filter(p => p.pid !== pid));
        if (selectedPid === pid) setSelectedPid(null);
        setConfirmDialog(null);
      }
    });
  };

  return (
    <div className="vessel-app flex flex-col w-full h-screen overflow-hidden text-sm font-sans select-none" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* Dynamic CSS Variables defined in scope */}
      <style>{`
        :root {
          --bg-main: #121214;
          --bg-surface: #18181b;
          --bg-card: #202024;
          --bg-hover: #27272a;
          --border-subtle: #27272a;
          --border-focus: #3f3f46;
          --text-primary: #fafafa;
          --text-secondary: #a1a1aa;
          --text-muted: #71717a;
          --accent-primary: #38bdf8;
          --accent-active: #ffffff;
          --status-green: #22c55e;
          --status-amber: #f59e0b;
          --status-red: #ef4444;
          --radius-sm: 0px;
          --radius-md: 0px;
          --radius-lg: 0px;
          --radius-pill: 9999px;
        }

        /* Scrollbar aesthetics matching matte charcoal theme */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg-main); }
        ::-webkit-scrollbar-thumb { background: #2f2f36; border-radius: var(--radius-pill); }
        ::-webkit-scrollbar-thumb:hover { background: #444450; }
      `}</style>

      {/* ==========================================
          HEADER (Fixed 56px height)
          ========================================== */}
      <header className="h-[56px] min-h-[56px] flex items-center justify-between px-4 border-b flex-shrink-0" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        {/* Left: App Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight flex items-center gap-2 text-white">
              Karo - Process Manager
              {/* <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">VesselSSH</span> */}
            </h1>
          </div>
        </div>

        {/* Right: Search + Overflow Menu */}
        <div className="flex items-center gap-3">
          {/* Global Filter Field */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}, PID, user...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-md bg-zinc-900/90 border border-zinc-700/60 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-sky-500/60 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* 3-Dot Overflow Menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-colors"
              title="More Actions & Settings"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-zinc-900 border border-zinc-700 shadow-2xl py-1.5 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Refresh Interval</div>
                {[1, 2, 5, 10, 0].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => { setRefreshInterval(sec); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <span>{sec === 0 ? 'Paused (Manual)' : `${sec} Second${sec > 1 ? 's' : ''}`}</span>
                    {refreshInterval === sec && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                ))}

                <div className="my-1.5 border-t border-zinc-800" />
                <div className="px-3 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Display Settings</div>
                
                <button
                  onClick={() => { setRowDensity(rowDensity === 'compact' ? 'comfortable' : 'compact'); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <span className="capitalize">Row Density: {rowDensity}</span>
                  <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {activeTab === 'processes' && (
                  <button
                    onClick={() => { setShowColumnModal(true); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    <span>Configure Columns...</span>
                    <Columns className="w-3.5 h-3.5 text-zinc-500" />
                  </button>
                )}

                <div className="my-1.5 border-t border-zinc-800" />
                <div className="px-3 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Export Data</div>
                
                <button onClick={() => { handleExportCSV(); setIsMenuOpen(false); }} className="w-full flex items-center justify-between px-3 py-1.5 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                  <span>Export view as CSV</span>
                  <Download className="w-3.5 h-3.5 text-zinc-500" />
                </button>
                
                <button onClick={() => { handleExportJSON(); setIsMenuOpen(false); }} className="w-full flex items-center justify-between px-3 py-1.5 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                  <span>Export view as JSON</span>
                  <Download className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                <div className="my-1.5 border-t border-zinc-800" />
                <button onClick={() => { setShowAboutModal(true); setIsMenuOpen(false); }} className="w-full flex items-center justify-between px-3 py-1.5 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                  <span>About Process Manager</span>
                  <Info className="w-3.5 h-3.5 text-zinc-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ==========================================
          HORIZONTAL NAVIGATION TABS
          ========================================== */}
      <nav className="px-4 border-b flex items-center gap-1 flex-shrink-0" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        {([
          { id: 'processes', label: 'Processes', icon: Cpu },
          { id: 'stats', label: 'System Stats', icon: Activity },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'services', label: 'Services', icon: Server },
          { id: 'logs', label: 'Logs', icon: FileText }
        ] as Array<{ id: Tab; label: string; icon: typeof Cpu }>).map(tab => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border-b-2 transition-all relative ${
                isActive
                  ? 'border-sky-400 text-white font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-zinc-400'}`} />
              {tab.label}
              {tab.id === 'processes' && userFilter && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-300 text-[10px]">
                  User: {userFilter}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ==========================================
          MAIN CONTENT AREA (SINGLE TAB ACTIVE)
          ========================================== */}
      <main className="flex-1 min-h-0 flex overflow-hidden">
        
        {/* ------------------------------------------
            1. PROCESSES TAB (DEFAULT)
            ------------------------------------------ */}
        {activeTab === 'processes' && (
          <div className="flex-1 flex w-full h-full overflow-hidden">
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
              
              {/* Compact Toolbar above table */}
              <div className="px-4 py-2 flex items-center justify-between border-b flex-shrink-0 bg-zinc-900/40 border-zinc-800">
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Total: <b className="text-zinc-100">{processes.length}</b>
                  </span>
                  <span>
                    Running: <b className="text-zinc-100">{processes.filter(p => p.s === 'R').length}</b>
                  </span>
                  <span>
                    Sleeping: <b className="text-zinc-100">{processes.filter(p => p.s === 'S').length}</b>
                  </span>
                  {userFilter && (
                    <button onClick={() => setUserFilter(null)} className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-sky-400 hover:bg-zinc-700 text-[11px]">
                      Clear user filter ({userFilter}) <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Selected Process quick actions */}
                {selectedProcessObj && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-zinc-400 mr-2 font-mono">PID: <strong className="text-white">{selectedProcessObj.pid}</strong></span>
                    <button
                      onClick={() => handleKillProcess(selectedProcessObj.pid, false)}
                      className="px-2.5 py-1 rounded text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1"
                    >
                      <Square className="w-3 h-3 text-amber-400" /> Terminate
                    </button>
                    <button
                      onClick={() => handleKillProcess(selectedProcessObj.pid, true)}
                      className="px-2.5 py-1 rounded text-xs bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3 text-red-400" /> Kill -9
                    </button>
                  </div>
                )}
              </div>

              {/* Process Table Container */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead className="sticky top-0 bg-zinc-900 border-b border-zinc-800 text-zinc-400 z-10 shadow-sm">
                    <tr>
                      <th className="py-2 px-3 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('pid')}>
                        PID {sortField === 'pid' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      {visibleColumns.ppid && (
                        <th className="py-2 px-3 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('ppid')}>
                          PPID {sortField === 'ppid' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                      )}
                      <th className="py-2 px-3 font-semibold cursor-pointer hover:text-white" onClick={() => handleSort('user')}>
                        USER {sortField === 'user' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      {visibleColumns.pri && <th className="py-2 px-3 font-semibold">PRI</th>}
                      {visibleColumns.ni && <th className="py-2 px-3 font-semibold">NI</th>}
                      <th className="py-2 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('cpu')}>
                        CPU % {sortField === 'cpu' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="py-2 px-3 font-semibold text-right cursor-pointer hover:text-white" onClick={() => handleSort('mem')}>
                        MEM % {sortField === 'mem' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      {visibleColumns.virt && <th className="py-2 px-3 font-semibold text-right">VIRT</th>}
                      <th className="py-2 px-3 font-semibold text-right">RES</th>
                      {visibleColumns.shr && <th className="py-2 px-3 font-semibold text-right">SHR</th>}
                      <th className="py-2 px-3 font-semibold text-center">S</th>
                      {visibleColumns.threads && <th className="py-2 px-3 font-semibold text-right">THR</th>}
                      <th className="py-2 px-3 font-semibold">COMMAND</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {filteredProcesses.map(proc => {
                      const isSelected = selectedPid === proc.pid;
                      const pyClass = rowDensity === 'compact' ? 'py-1' : 'py-2';
                      return (
                        <tr
                          key={proc.pid}
                          onClick={() => setSelectedPid(proc.pid)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-sky-950/30 text-white font-medium border-l-2 border-sky-400'
                              : 'hover:bg-zinc-800/40 text-zinc-300'
                          }`}
                        >
                          <td className={`${pyClass} px-3 text-sky-400`}>{proc.pid}</td>
                          {visibleColumns.ppid && <td className={`${pyClass} px-3 text-zinc-500`}>{proc.ppid}</td>}
                          <td className={`${pyClass} px-3 text-zinc-300`}>{proc.user}</td>
                          {visibleColumns.pri && <td className={`${pyClass} px-3 text-zinc-500`}>{proc.pri}</td>}
                          {visibleColumns.ni && <td className={`${pyClass} px-3 text-zinc-500`}>{proc.ni}</td>}
                          <td className={`${pyClass} px-3 text-right`}>
                            <span className={proc.cpu > 15 ? 'text-amber-400 font-semibold' : proc.cpu > 5 ? 'text-zinc-200' : 'text-zinc-400'}>
                              {proc.cpu.toFixed(1)}
                            </span>
                          </td>
                          <td className={`${pyClass} px-3 text-right text-zinc-300`}>{proc.mem.toFixed(1)}</td>
                          {visibleColumns.virt && <td className={`${pyClass} px-3 text-right text-zinc-400`}>{proc.virt}</td>}
                          <td className={`${pyClass} px-3 text-right text-zinc-300`}>{proc.res}</td>
                          {visibleColumns.shr && <td className={`${pyClass} px-3 text-right text-zinc-500`}>{proc.shr}</td>}
                          <td className={`${pyClass} px-3 text-center`}>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${proc.s === 'R' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' : 'bg-zinc-800 text-zinc-400'}`}>
                              {proc.s}
                            </span>
                          </td>
                          {visibleColumns.threads && <td className={`${pyClass} px-3 text-right text-zinc-400`}>{proc.threads}</td>}
                          <td className={`${pyClass} px-3 max-w-xs truncate font-mono text-zinc-300`} title={proc.command}>
                            {proc.command}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right-Side Process Details Panel */}
            {selectedProcessObj && (
              <aside className="w-80 border-l border-zinc-800 bg-zinc-900/60 p-4 flex flex-col justify-between overflow-y-auto flex-shrink-0">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        Process Details
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono">PID: {selectedProcessObj.pid}</p>
                    </div>
                    <button onClick={() => setSelectedPid(null)} className="text-zinc-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary Properties */}
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-zinc-500 text-[11px] block uppercase font-mono">Command</span>
                      <div className="p-2 rounded bg-zinc-950 border border-zinc-800 font-mono text-sky-300 break-all select-all">
                        {selectedProcessObj.command}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/60">
                        <span className="text-zinc-500 text-[10px] uppercase block">User</span>
                        <span className="font-semibold text-zinc-200">{selectedProcessObj.user}</span>
                      </div>
                      <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/60">
                        <span className="text-zinc-500 text-[10px] uppercase block">Parent PID</span>
                        <span className="font-mono text-zinc-200">{selectedProcessObj.ppid}</span>
                      </div>
                      <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/60">
                        <span className="text-zinc-500 text-[10px] uppercase block">CPU %</span>
                        <span className="font-semibold text-amber-400">{selectedProcessObj.cpu}%</span>
                      </div>
                      <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/60">
                        <span className="text-zinc-500 text-[10px] uppercase block">Memory</span>
                        <span className="font-semibold text-sky-400">{selectedProcessObj.res}</span>
                      </div>
                      <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/60">
                        <span className="text-zinc-500 text-[10px] uppercase block">Threads</span>
                        <span className="font-mono text-zinc-200">{selectedProcessObj.threads}</span>
                      </div>
                      <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/60">
                        <span className="text-zinc-500 text-[10px] uppercase block">CPU Time</span>
                        <span className="font-mono text-zinc-200">{selectedProcessObj.time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Side Panel Action Buttons */}
                <div className="pt-4 border-t border-zinc-800 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedProcessObj.pid.toString())}
                      className="flex-1 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3 h-3" /> Copy PID
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedProcessObj.command)}
                      className="flex-1 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3 h-3" /> Copy Cmd
                    </button>
                  </div>
                  <button
                    onClick={() => handleKillProcess(selectedProcessObj.pid, false)}
                    className="w-full py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium"
                  >
                    Terminate Process (SIGTERM)
                  </button>
                  <button
                    onClick={() => handleKillProcess(selectedProcessObj.pid, true)}
                    className="w-full py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium"
                  >
                    Force Kill (SIGKILL -9)
                  </button>
                </div>
              </aside>
            )}
          </div>
        )}

        {/* ------------------------------------------
            2. SYSTEM STATS TAB
            ------------------------------------------ */}
        {activeTab === 'stats' && (
          <div className="flex-1 p-5 overflow-y-auto space-y-6">
            
            {/* Top 4 Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* CPU Card */}
              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">CPU Utilization</span>
                  <Cpu className="w-4 h-4 text-sky-400" />
                </div>
                <div className="my-2">
                  <span className="text-2xl font-bold font-mono text-white">
                    {cpuHistory[cpuHistory.length - 1]}%
                  </span>
                  <span className="text-xs text-zinc-500 ml-2">12 Cores</span>
                </div>
                {/* Mini SVG Sparkline */}
                <svg className="w-full h-8 stroke-sky-400 fill-none" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path
                    d={`M 0 ${30 - (cpuHistory[0]/100)*30} ` + cpuHistory.map((val, idx) => `L ${(idx / (cpuHistory.length - 1)) * 100} ${30 - (val/100)*30}`).join(' ')}
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Memory Card */}
              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">RAM Usage</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="my-2">
                  <span className="text-2xl font-bold font-mono text-white">
                    7.8 <span className="text-sm font-normal text-zinc-400">/ 16 GB</span>
                  </span>
                  <span className="text-xs text-emerald-400 ml-2">48.7%</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '48.7%' }} />
                </div>
              </div>

              {/* Swap Card */}
              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Swap Space</span>
                  <HardDrive className="w-4 h-4 text-purple-400" />
                </div>
                <div className="my-2">
                  <span className="text-2xl font-bold font-mono text-white">
                    412 <span className="text-sm font-normal text-zinc-400">/ 4096 MB</span>
                  </span>
                  <span className="text-xs text-zinc-400 ml-2">10.0%</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '10.0%' }} />
                </div>
              </div>

              {/* Processes Summary Card */}
              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">Process Status</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="my-2 flex items-baseline justify-between font-mono">
                  <div>
                    <span className="text-2xl font-bold text-white">{processes.length}</span>
                    <span className="text-xs text-zinc-500 block">Total</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-emerald-400">{processes.filter(p => p.s === 'R').length} Active</span>
                    <span className="text-xs text-zinc-500 block">0 Zombie</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Per-Core Logical CPU Grid */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Logical Cores (12 Cores)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {perCoreStats.map(core => (
                  <div key={core.id} className="p-3 rounded-md bg-zinc-900/80 border border-zinc-800">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-mono text-zinc-400">CPU {core.id}</span>
                      <span className="font-mono font-semibold text-sky-400">{core.usage}%</span>
                    </div>
                    <svg className="w-full h-6 stroke-sky-500/80 fill-none" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <path
                        d={`M 0 ${30 - (core.history[0]/100)*30} ` + core.history.map((val, idx) => `L ${(idx / (core.history.length - 1)) * 100} ${30 - (val/100)*30}`).join(' ')}
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Historical Graphs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                <h4 className="text-xs font-semibold text-zinc-300 mb-2">Overall CPU Utilization (Last 60s)</h4>
                <div className="h-40 w-full relative">
                  <svg className="w-full h-full stroke-sky-400 fill-sky-500/10" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                      d={`M 0 100 ` + cpuHistory.map((val, idx) => `L ${(idx / (cpuHistory.length - 1)) * 100} ${100 - val}`).join(' ') + ` L 100 100 Z`}
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                <h4 className="text-xs font-semibold text-zinc-300 mb-2">Memory Allocation (RAM + Swap)</h4>
                <div className="h-40 w-full relative">
                  <svg className="w-full h-full stroke-emerald-400 fill-emerald-500/10" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                      d={`M 0 100 ` + memHistory.map((val, idx) => `L ${(idx / (memHistory.length - 1)) * 100} ${100 - val}`).join(' ') + ` L 100 100 Z`}
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------
            3. USERS TAB
            ------------------------------------------ */}
        {activeTab === 'users' && (
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="mb-3 flex justify-between items-center">
              <span className="text-xs text-zinc-400">Linux OS User Accounts ({MOCK_USERS.length})</span>
            </div>
            
            <div className="rounded-lg border border-zinc-800 overflow-hidden bg-zinc-900/60">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">USER</th>
                    <th className="py-2.5 px-4 font-semibold">UID</th>
                    <th className="py-2.5 px-4 font-semibold text-right">PROCESSES</th>
                    <th className="py-2.5 px-4 font-semibold text-right">CPU %</th>
                    <th className="py-2.5 px-4 font-semibold text-right">MEMORY</th>
                    <th className="py-2.5 px-4 font-semibold text-right">MEM %</th>
                    <th className="py-2.5 px-4 font-semibold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {MOCK_USERS.map(u => (
                    <tr key={u.uid} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-4 text-white font-semibold flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        {u.user}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">{u.uid}</td>
                      <td className="py-3 px-4 text-right text-zinc-300">{u.processes}</td>
                      <td className="py-3 px-4 text-right text-amber-400">{u.cpu}%</td>
                      <td className="py-3 px-4 text-right text-zinc-300">{u.memory}</td>
                      <td className="py-3 px-4 text-right text-sky-400">{u.memPct}%</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleViewUserProcesses(u.user)}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-sky-300 text-xs border border-zinc-700 font-sans"
                        >
                          View Processes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------
            4. SERVICES TAB
            ------------------------------------------ */}
        {activeTab === 'services' && (
          <div className="flex-1 flex h-full overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="rounded-lg border border-zinc-800 overflow-hidden bg-zinc-900/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-mono">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">SERVICE</th>
                      <th className="py-2.5 px-4 font-semibold">STATUS</th>
                      <th className="py-2.5 px-4 font-semibold">STARTUP</th>
                      <th className="py-2.5 px-4 font-semibold">MAIN PID</th>
                      <th className="py-2.5 px-4 font-semibold">DESCRIPTION</th>
                      <th className="py-2.5 px-4 font-semibold text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono">
                    {MOCK_SERVICES.map(svc => {
                      const isSelected = selectedService?.service === svc.service;
                      return (
                        <tr
                          key={svc.service}
                          onClick={() => setSelectedService(svc)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-sky-950/30 text-white' : 'hover:bg-zinc-800/40 text-zinc-300'
                          }`}
                        >
                          <td className="py-3 px-4 font-bold text-white">{svc.service}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-medium flex items-center gap-1 w-max ${
                              svc.status === 'Running'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                : svc.status === 'Stopped'
                                ? 'bg-zinc-800 text-zinc-400'
                                : 'bg-red-950 text-red-400 border border-red-800/60'
                            }`}>
                              {svc.status === 'Running' && <CheckCircle2 className="w-3 h-3" />}
                              {svc.status === 'Failed' && <XCircle className="w-3 h-3" />}
                              {svc.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-400">{svc.startup}</td>
                          <td className="py-3 px-4 text-sky-400">{svc.pid}</td>
                          <td className="py-3 px-4 text-zinc-400 max-w-xs truncate font-sans">{svc.description}</td>
                          <td className="py-3 px-4 text-right font-sans">
                            <div className="flex gap-1 justify-end">
                              {svc.status === 'Running' ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); }}
                                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px]"
                                >
                                  Restart
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); }}
                                  className="px-2 py-1 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-800/40 text-[11px]"
                                >
                                  Start
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Service Detail Side Drawer */}
            {selectedService && (
              <aside className="w-80 border-l border-zinc-800 bg-zinc-900/60 p-4 flex flex-col justify-between overflow-y-auto">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{selectedService.service}</h3>
                  <p className="text-xs text-zinc-400 mb-4">{selectedService.description}</p>
                  
                  <div className="space-y-3 text-xs">
                    <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 text-[10px] uppercase block">Active State</span>
                      <span className="font-semibold text-white">{selectedService.status}</span>
                    </div>
                    <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 text-[10px] uppercase block">Systemd Unit File</span>
                      <span className="font-mono text-zinc-300">/etc/systemd/system/{selectedService.service}</span>
                    </div>
                    <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-zinc-500 text-[10px] uppercase block">Main PID</span>
                      <span className="font-mono text-sky-400">{selectedService.pid}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-zinc-800">
                  <button className="w-full py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium">
                    View Journal Logs
                  </button>
                  <button className="w-full py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium">
                    Reload Configuration
                  </button>
                </div>
              </aside>
            )}
          </div>
        )}

        {/* ------------------------------------------
            5. LOGS TAB
            ------------------------------------------ */}
        {activeTab === 'logs' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
            
            {/* Logs Toolbar */}
            <div className="p-3 border-b border-zinc-800 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-medium">Severity:</span>
                {['ALL', 'INFO', 'WARN', 'ERROR'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setLogSeverityFilter(sev)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      logSeverityFilter === sev
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLogPaused(!isLogPaused)}
                  className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 ${
                    isLogPaused
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {isLogPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                  {isLogPaused ? 'Resume' : 'Pause'}
                </button>

                <button
                  onClick={() => setLogs([])}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3 text-zinc-400" /> Clear Display
                </button>
              </div>
            </div>

            {/* Terminal Log Console */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1.5">
              {logs
                .filter(l => logSeverityFilter === 'ALL' || l.severity === logSeverityFilter)
                .map(log => (
                  <div key={log.id} className="flex items-start gap-3 hover:bg-zinc-900/60 p-1 rounded">
                    <span className="text-zinc-500 shrink-0">{log.timestamp}</span>
                    <span className={`shrink-0 px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      log.severity === 'ERROR'
                        ? 'bg-red-950 text-red-400 border border-red-800/60'
                        : log.severity === 'WARN'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        : 'bg-blue-950 text-sky-400 border border-blue-800/60'
                    }`}>
                      {log.severity}
                    </span>
                    <span className="text-zinc-400 shrink-0">[{log.source}]</span>
                    <span className="text-zinc-200 break-all">{log.message}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

      </main>

      {/* ==========================================
          MODALS & DIALOG OVERLAYS
          ========================================== */}
      
      {/* Column Config Modal */}
      {showColumnModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-96 rounded-lg bg-zinc-900 border border-zinc-700 p-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white">Configure Optional Columns</h3>
              <button onClick={() => setShowColumnModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-2 text-xs">
              {(Object.keys(visibleColumns) as Array<keyof VisibleColumns>).map(key => (
                <label key={key} className="flex items-center justify-between p-2 rounded hover:bg-zinc-800/60 cursor-pointer">
                  <span className="uppercase font-mono text-zinc-300">{key}</span>
                  <input
                    type="checkbox"
                    checked={visibleColumns[key]}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-950 text-sky-500 focus:ring-0"
                  />
                </label>
              ))}
            </div>
            <button
              onClick={() => setShowColumnModal(false)}
              className="w-full py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-96 rounded-lg bg-zinc-900 border border-zinc-700 p-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white">About VesselSSH Process Manager</h3>
              <button onClick={() => setShowAboutModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 text-xs space-y-2 text-zinc-300">
              <p><b>VesselSSH Process Manager</b> v1.0.4</p>
              <p className="text-zinc-400">An open-source, high-density Linux server management GUI and utility interface built for cloud developer workflows.</p>
            </div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-96 rounded-lg bg-zinc-900 border border-zinc-700 p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-red-400 mb-2">{confirmDialog.title}</h3>
            <p className="text-xs text-zinc-300 mb-5">{confirmDialog.message}</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-medium text-xs"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
