'use client';

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Users, 
  Gavel, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X,
  Package,
  Tag,
  DollarSign,
  FileText,
  Filter
} from 'lucide-react';

export interface InventoryItem {
  id: string;
  title: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  condition: 'Mint' | 'Excellent' | 'Good' | 'Fair' | 'New';
  description: string;
  status: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK';
}

const INITIAL_INVENTORY: InventoryItem[] = [];