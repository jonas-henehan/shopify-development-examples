var FreeGift = class extends HTMLElement {
  constructor() {
    super();
    this.addToCartButtons = null;
  }

  connectedCallback() {
    this.initEventListeners();
  }

  initEventListeners() {
    const addToCartButtons = this.querySelectorAll('.cart-progress__free-product--add');
    if (addToCartButtons) {
      addToCartButtons.forEach(button => button.addEventListener('click', (event) => this._freeGiftAddToCart(event, button)));
    }
    const variantSelectors = this.querySelectorAll('.cart-progress__free-product--variant-select');
    if(variantSelectors) {
      variantSelectors.forEach(selector => selector.addEventListener('change', (event) => this._updateVariant(event, selector)));
    }

    const ageCheckboxes = this.querySelectorAll('input[type="checkbox"]');
    if(ageCheckboxes) {
      ageCheckboxes.forEach(checkbox => checkbox.addEventListener('change', () => this._handleCheckbox(checkbox)));
    }
  }

  async _updateElement() {
    const res = await fetch('/?section_id=header');
    const section = await res.text();
    const header = document.createElement('div');
    header.innerHTML = section;

    const updatedCartContents = header.querySelector(`free-gift`);
    const currentCartContents = document.querySelector(`free-gift`);
    if (currentCartContents && updatedCartContents) {
      currentCartContents.innerHTML = updatedCartContents.innerHTML;
    }
    
    this.reinitializeEventListeners();
  }

  _updateVariant(event, selector) {
    const parent = event.target.closest('.cart-progress__free-product');
    const id = event.target.value;
    const addToCartButton = parent.querySelector('.cart-progress__free-product--add');
    const images = parent.querySelectorAll('.free-product__image-wrapper img');
    const variantImage = parent.querySelector(`#variant-image--${id}`);
    const ageCheck = parent.querySelector('input[type="checkbox"]');

    images.forEach(img => img.style.opacity = 0);
    variantImage.style.opacity = 1;

    if(id) {
      if(ageCheck) {
        if (ageCheck.checked) {
          addToCartButton.removeAttribute('disabled');
        }
      } else {
        addToCartButton.removeAttribute('disabled');
      }
    }
  }

  _handleCheckbox(checkbox) {
    const parent = event.target.closest('.cart-progress__free-product');
    const addToCartButton = parent.querySelector('.cart-progress__free-product--add');
    const variantSelector = parent.querySelector('.cart-progress__free-product--variant-select');
    if(checkbox.checked) {
      if(variantSelector) {
        if (variantSelector.value) {
          addToCartButton.removeAttribute('disabled');
        }
      } else {
        addToCartButton.removeAttribute('disabled');
      }
    }
    if(!checkbox.checked){
      addToCartButton.setAttribute('disabled', 'disabled');
    }
  }
  
  _freeGiftAddToCart(event, button) {
    event.preventDefault();
    button.setAttribute('disabled', 'disabled');
    //document.dispatchEvent(new CustomEvent('theme:loading:start'));

    const parent = event.target.closest('[data-gift-form]');
    const input = parent.querySelector('[name="variant"]');
    const variantId = input.value;
    const giftNumber = parent.dataset.gift;

    if (!button.classList.contains('loading')){
      button.setAttribute('aria-disabled', true);
      button.classList.add('loading');  
    }

    let formData = {
      items: [
        {
          id: variantId,
          quantity: 1,
          properties: {
            '_Gift': `${giftNumber}`
          }
        }
      ]
    };
    fetch(`${theme.routes.cart_add_url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then((response) => response.json())
    .then((response) => {
      dispatchCustomEvent('cart:item-added', {
        product: response.hasOwnProperty('items') ? response.items[0] : response
      });
    })
    .catch((e) => {
      console.error(e);
    })
    .finally(() => {
      button.innerText = "Added";
      this._updateElement();
    });
  }

  reinitializeEventListeners() {
    if (this.addToCartButton) {
      this.addToCartButton.removeEventListener('click', this._freeGiftAddToCart);
    }
    this.initEventListeners();
  }
};
window.customElements.define('free-gift', FreeGift);

document.addEventListener('DOMContentLoaded', () => {
  const freeGift = document.querySelector('free-gift');
  if (freeGift) {
    freeGift.initEventListeners();
  }
});