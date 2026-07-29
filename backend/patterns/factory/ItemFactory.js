const {
  PhoneItem,
  ElectronicItem,
  WalletIdItem,
  BagItem,
  BookItem,
  KeysItem,
  JewelryItem,
  OtherItem
} = require('./ItemCategory');

/**
 * Simple Factory Pattern
 * Centralizes object creation for campus item categories.
 * Controllers use this class instead of directly creating category-specific objects.
 */
class ItemFactory {
  static createItem({ category, title, location, description }) {
    const data = { category, title, location, description };

    switch (category) {
      case 'Phone':
        return new PhoneItem(data);
      case 'Laptop / electronic device':
        return new ElectronicItem(data);
      case 'Wallet / ID / bank card':
        return new WalletIdItem(data);
      case 'Backpack / bag':
        return new BagItem(data);
      case 'Book / notebook':
        return new BookItem(data);
      case 'Keys':
        return new KeysItem(data);
      case 'Jewelry':
        return new JewelryItem(data);
      case 'Other':
      default:
        return new OtherItem(data);
    }
  }
}

module.exports = ItemFactory;
