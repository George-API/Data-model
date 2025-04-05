/**
 * Schema Example File
 * 
 * This file contains examples of TypeScript schema elements
 * that can be visualized by the Schema Model tool.
 */

// Basic interface example
export interface User {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  profile?: UserProfile;
  role: UserRole;
}

// Interface that extends another interface
export interface AdminUser extends User {
  permissions: string[];
  isSuperAdmin: boolean;
  managedSections: Section[];
}

// Interface with methods
export interface Repository {
  name: string;
  owner: string;
  isPrivate: boolean;
  clone(): Promise<boolean>;
  commit(message: string): void;
  listBranches(): string[];
}

// Type alias with primitive type
export type UserId = string;

// Complex type alias with object structure
export type UserProfile = {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio: string;
  links: {
    website?: string;
    twitter?: string;
    github?: string;
  };
  skills: string[];
};

// Union type
export type Status = 'pending' | 'active' | 'suspended' | 'deleted';

// Intersection type
export type AdminSettings = UserProfile & {
  dashboardView: 'compact' | 'detailed';
  notifications: boolean;
};

// Enum example
export enum UserRole {
  Guest = 'guest',
  User = 'user',
  Moderator = 'moderator',
  Admin = 'admin'
}

// Enum with numeric values
export enum Priority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

// Class example
export class Section {
  id: string;
  name: string;
  private _items: Item[];
  
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this._items = [];
  }
  
  addItem(item: Item): void {
    this._items.push(item);
  }
  
  getItems(): Item[] {
    return [...this._items];
  }
  
  get itemCount(): number {
    return this._items.length;
  }
}

// Class that implements an interface
export class UserRepository implements Repository {
  name: string;
  owner: string;
  isPrivate: boolean;
  
  constructor(name: string, owner: string, isPrivate: boolean = false) {
    this.name = name;
    this.owner = owner;
    this.isPrivate = isPrivate;
  }
  
  async clone(): Promise<boolean> {
    console.log(`Cloning ${this.name}...`);
    return true;
  }
  
  commit(message: string): void {
    console.log(`Committing: ${message}`);
  }
  
  listBranches(): string[] {
    return ['main', 'develop'];
  }
}

// Interface that references other types
export interface Item {
  id: string;
  name: string;
  status: Status;
  priority: Priority;
  assignee?: User;
  repository?: Repository;
}

// Generic interface
export interface Collection<T> {
  items: T[];
  add(item: T): void;
  remove(index: number): T | undefined;
  find(predicate: (item: T) => boolean): T | undefined;
}

// Generic class implementing generic interface
export class ItemCollection implements Collection<Item> {
  items: Item[] = [];
  
  add(item: Item): void {
    this.items.push(item);
  }
  
  remove(index: number): Item | undefined {
    if (index >= 0 && index < this.items.length) {
      const [removed] = this.items.splice(index, 1);
      return removed;
    }
    return undefined;
  }
  
  find(predicate: (item: Item) => boolean): Item | undefined {
    return this.items.find(predicate);
  }
} 