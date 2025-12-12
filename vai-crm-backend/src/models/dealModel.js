// vai-crm-backend/models/dealModel.js
let deals = [];
let currentId = 1;

export const dealModel = {
  async findAll() {
    return deals; // Retorna array em memória
  },
  
  async create(dealData) {
    const newDeal = {
      id: currentId++,
      ...dealData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    deals.push(newDeal);
    return newDeal;
  },
  
  async findById(id) {
    return deals.find(d => d.id === id);
  },
  
  async update(id, updates) {
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) return null;
    
    deals[index] = { ...deals[index], ...updates, updatedAt: new Date() };
    return deals[index];
  }
};