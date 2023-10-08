class InventoryNotice extends HTMLElement {
  constructor() {
    super();
  }

  _updateElement(variant) {
    const elementId = `inventory-${this.dataset.section}`;

    fetch(`${this.dataset.url}?variant=${variant.id}&section_id=${this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const destination = document.getElementById(elementId);
        const source = html.getElementById(elementId);
        if (source && destination) destination.innerHTML = source.innerHTML;
    });
  }
}

customElements.define('inventory-notice', InventoryNotice);
