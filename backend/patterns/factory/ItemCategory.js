class CampusItem {
  constructor({ category, title, location, description }) {
    this.category = category;
    this.title = title;
    this.location = location;
    this.description = description || '';
  }

  getSearchKeywords() {
    return `${this.title} ${this.location} ${this.description}`.toLowerCase().split(/\W+/).filter(Boolean);
  }

  getVerificationHint() {
    return 'Ask claimant to provide unique identifying details.';
  }
}

class PhoneItem extends CampusItem {
  getVerificationHint() {
    return 'Ask for phone model, color, case, wallpaper, lock-screen details, or serial/IMEI if available.';
  }
}

class ElectronicItem extends CampusItem {
  getVerificationHint() {
    return 'Ask for brand, model, stickers, serial number, charger type, or login-screen details.';
  }
}

class WalletIdItem extends CampusItem {
  getVerificationHint() {
    return 'Ask for name on ID, card issuer, wallet color, and unique contents.';
  }
}

class BagItem extends CampusItem {
  getVerificationHint() {
    return 'Ask for bag brand, color, keychains, pins, and contents inside pockets.';
  }
}

class BookItem extends CampusItem {
  getVerificationHint() {
    return 'Ask for book title, course name, notes, labels, or handwriting details.';
  }
}

class KeysItem extends CampusItem {
  getVerificationHint() {
    return 'Ask for number of keys, key ring color, tags, fobs, and unusual key shapes.';
  }
}

class JewelryItem extends CampusItem {
  getVerificationHint() {
    return 'Ask for material, engraving, stone color, size, and where it was lost.';
  }
}

class OtherItem extends CampusItem {}

module.exports = {
  CampusItem,
  PhoneItem,
  ElectronicItem,
  WalletIdItem,
  BagItem,
  BookItem,
  KeysItem,
  JewelryItem,
  OtherItem
};
