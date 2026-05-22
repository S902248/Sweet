import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/mock_db.json');

// Ensure data folder exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbData = {
  users: [],
  branches: [],
  products: [],
  categories: [],
  orders: [],
  bills: [],
  customers: [],
  employees: [],
  notifications: [],
  activitylogs: [],
  suppliers: []
};

// Load existing data if available
const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      dbData = JSON.parse(content);
      
      // Auto-migrate irregular plurals
      let migrated = false;
      if (dbData.branchs) {
        dbData.branches = [...(dbData.branches || []), ...dbData.branchs];
        delete dbData.branchs;
        migrated = true;
      }
      if (dbData.categorys) {
        dbData.categories = [...(dbData.categories || []), ...dbData.categorys];
        delete dbData.categorys;
        migrated = true;
      }
      if (migrated) {
        saveData();
        console.log('Migrated mock_db.json collection keys to correct plurals.');
      }
    } else {
      saveData();
    }
  } catch (err) {
    console.error('Error loading mock database file:', err);
  }
};

const saveData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving mock database file:', err);
  }
};

loadData();

const getCollectionName = (name) => {
  const lower = name.toLowerCase();
  if (lower === 'branch') return 'branches';
  if (lower === 'category') return 'categories';
  return lower + 's';
};

export const mockDb = {
  getCollection: (name) => {
    const colName = getCollectionName(name);
    return dbData[colName] || [];
  },

  find: (collection, query = {}) => {
    let list = mockDb.getCollection(collection);
    // Simple filter
    return list.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  },

  findOne: (collection, query = {}) => {
    const list = mockDb.find(collection, query);
    return list.length > 0 ? list[0] : null;
  },

  findById: (collection, id) => {
    const list = mockDb.getCollection(collection);
    return list.find(item => item._id === id || item.id === id) || null;
  },

  create: (collection, data) => {
    const colName = getCollectionName(collection);
    if (!dbData[colName]) dbData[colName] = [];
    
    const newItem = {
      _id: 'mock_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    dbData[colName].push(newItem);
    saveData();
    return newItem;
  },

  findByIdAndUpdate: (collection, id, updateData) => {
    const colName = getCollectionName(collection);
    const list = dbData[colName] || [];
    const index = list.findIndex(item => item._id === id || item.id === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      saveData();
      return list[index];
    }
    return null;
  },

  findByIdAndDelete: (collection, id) => {
    const colName = getCollectionName(collection);
    const list = dbData[colName] || [];
    const index = list.findIndex(item => item._id === id || item.id === id);
    if (index !== -1) {
      const deletedItem = list.splice(index, 1)[0];
      saveData();
      return deletedItem;
    }
    return null;
  },

  clearAll: () => {
    for (let key in dbData) {
      dbData[key] = [];
    }
    saveData();
  }
};

// Global DB runner: runs real mongoose model if mongoose is connected & USE_MOCK_DB is false, else runs mock DB
export const runDb = async (modelName, action, ...args) => {
  const useMock = process.env.USE_MOCK_DB === 'true';
  if (useMock) {
    if (action === 'find') return mockDb.find(modelName, args[0]);
    if (action === 'findOne') return mockDb.findOne(modelName, args[0]);
    if (action === 'findById') return mockDb.findById(modelName, args[0]);
    if (action === 'create') return mockDb.create(modelName, args[0]);
    if (action === 'findByIdAndUpdate') return mockDb.findByIdAndUpdate(modelName, args[0], args[1]);
    if (action === 'findByIdAndDelete') return mockDb.findByIdAndDelete(modelName, args[0]);
  }
  return null;
};
