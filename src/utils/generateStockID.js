import { customAlphabet } from 'nanoid';
import { Category } from '../models/stock.model.js';

export default function generateStockId(categoryKey) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nanoid = customAlphabet(alphabet, 6); 
  
  return `${Category[categoryKey].slice(0, 3).toUpperCase()}-${nanoid()}`; // CO-XYZ123
}
