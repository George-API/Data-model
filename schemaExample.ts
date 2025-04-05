// --- Enums & Type Aliases ---

export enum TaskStatus {
    Todo = "todo",
    InProgress = "in_progress",
    Review = "review",
    Done = "done",
    Blocked = "blocked",
  }
  
  export enum Priority {
    Low = "low",
    Medium = "medium",
    High = "high",
    Critical = "critical",
  }
  
  export enum Role {
    Admin = "admin",
    Manager = "manager",
    Contributor = "contributor",
    Viewer = "viewer",
  }
  
  export enum AuthProvider {
    Email = "email",
    Google = "google",
    Github = "github",
  }
  
  export type UserID = string;
  export type ProjectID = string;
  export type TaskID = string;
  export type CommentID = string;
  export type NotificationID = string;
  export type Timestamp = string;
  
  // --- Reusable Types ---
  
  export interface ErrorState {
    message: string;
    code?: number;
    retry?: () => void;
  }
  
  export type Paginated<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
  
  // --- Auth & Session ---
  
  export interface MFAConfig {
    enabled: boolean;
    method: "totp" | "sms";
    verified: boolean;
  }
  
  export interface AuthSession {
    token: string;
    refreshToken: string;
    expiresAt: Timestamp;
    userId: UserID;
    provider: AuthProvider;
    onboardingCompleted: boolean;
    mfa?: MFAConfig;
  }
  
  export interface AuthSlice {
    session: AuthSession | null;
    loading: boolean;
    error?: ErrorState;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshSession: () => Promise<void>;
    completeOnboarding: () => void;
  }
  
  // --- User & Preferences ---
  
  export interface User {
    id: UserID;
    name: string;
    email: string;
    role: Role;
    avatarUrl?: string;
    lastSeen?: Timestamp;
    preferences: {
      theme: "light" | "dark" | "system";
      language: string;
      dateFormat: "relative" | "absolute";
    };
    featureFlags: Record<string, boolean>;
    experiments?: Record<string, string>; // e.g., A/B test groups
  }
  
  export interface UserSlice {
    byId: Record<UserID, User>;
    loading: boolean;
    currentUser?: User;
    fetchUser: (id: UserID) => Promise<void>;
    updatePreferences: (prefs: Partial<User["preferences"]>) => Promise<void>;
  }
  
  // --- Tasks & Comments ---
  
  export interface Comment {
    id: CommentID;
    taskId: TaskID;
    authorId: UserID;
    content: string;
    createdAt: Timestamp;
    deleted?: boolean;
    reactions?: Record<string, number>;
  }
  
  export interface Task {
    id: TaskID;
    projectId: ProjectID;
    title: string;
    description?: string;
    assignees: UserID[];
    status: TaskStatus;
    priority: Priority;
    tags?: string[];
    commentIds: CommentID[];
    dependencies?: TaskID[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
    archived?: boolean;
    optimistic?: boolean;
  }
  
  export interface TaskSlice {
    byId: Record<TaskID, Task>;
    loading: boolean;
    dirtyTasks: Set<TaskID>;
    fetchForProject: (projectId: ProjectID) => Promise<void>;
    updateTask: (taskId: TaskID, updates: Partial<Task>) => void;
    addComment: (taskId: TaskID, content: string) => Promise<void>;
    optimisticUpdate: (task: Task) => void;
  }
  
  // --- Projects ---
  
  export interface Project {
    id: ProjectID;
    name: string;
    description?: string;
    ownerId: UserID;
    members: UserID[];
    settings: {
      allowPublicView: boolean;
      defaultPriority: Priority;
      color?: string;
    };
    archived: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  
  export interface ProjectSlice {
    byId: Record<ProjectID, Project>;
    selectedProjectId: ProjectID | null;
    loading: boolean;
    createProject: (input: Partial<Project>) => Promise<ProjectID>;
    selectProject: (id: ProjectID) => void;
  }
  
  // --- UI & Layout ---
  
  export type ModalType = "createTask" | "editProject" | "inviteUsers" | null;
  export type DrawerType = "taskDetails" | "userSettings" | null;
  
  export interface UISlice {
    modals: {
      active: ModalType;
      open: (modal: ModalType) => void;
      close: () => void;
    };
    drawers: {
      active: DrawerType;
      open: (drawer: DrawerType) => void;
      close: () => void;
    };
    theme: "light" | "dark" | "system";
    setTheme: (theme: "light" | "dark" | "system") => void;
  }
  
  // --- Notifications & Events ---
  
  export interface Notification {
    id: NotificationID;
    userId: UserID;
    type: "info" | "success" | "error" | "warning";
    message: string;
    read: boolean;
    createdAt: Timestamp;
    actionUrl?: string;
  }
  
  export interface NotificationSlice {
    list: Notification[];
    unreadCount: number;
    fetch: () => Promise<void>;
    markAllRead: () => void;
    pushLocal: (notif: Omit<Notification, "id" | "createdAt">) => void;
  }
  
  // --- Background Sync & Jobs ---
  
  export interface JobStatus {
    id: string;
    type: "syncTasks" | "generateReport" | "exportData";
    status: "pending" | "running" | "success" | "failed";
    startedAt?: Timestamp;
    endedAt?: Timestamp;
    progress?: number;
    error?: ErrorState;
  }
  
  export interface JobSlice {
    jobs: Record<string, JobStatus>;
    triggerJob: (type: JobStatus["type"]) => Promise<void>;
    pollJobs: () => void;
  }
  
  // --- Root Zustand Store ---
  
  export interface AppStore
    extends AuthSlice,
      UserSlice,
      ProjectSlice,
      TaskSlice,
      NotificationSlice,
      UISlice,
      JobSlice {}
  