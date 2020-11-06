import "./App.css";
import React, { useState} from "react";
import { gql, useQuery } from "@apollo/client";
import Select from 'react-select';
import currencySymbols from  './symbols';


function App() {


  const [defaultSymbol, setDefaultSymbol]  = useState({ code: 'USD', symbol: `$`});
  const [openSidepanel, setOpenSidePanel] = useState(false);
  const [, setProducts]  = useState([]);
  const [selectedOption, setSelectedOption] =  useState(null);
  const [useDefault, setUseDefault] = useState(true);
  const [cart, setCartItem] = useState([]);

  const removeFromCart = product => {
    const cartClone = [...cart];
    const existingCart = cart.filter(each => each.id === product.id)[0];
  
    if (existingCart["quantity"] > 1) {
      existingCart["quantity"] = existingCart["quantity"] - 1 || 1;
      cartClone.map(obj => [existingCart].find(o => o.id === obj.id) || obj);
  
      return setCartItem(cartClone);
    }
  
    const filteredLists = cartClone.filter(x => {
      return x.id !== product.id;
    });
  
    return setCartItem(filteredLists);
  };
  const addToCart = product => {
   
    const cartClone = [...cart];
    const existingCart = cart.filter(each => each.id === product.id)[0];
  
    if (existingCart) {
      existingCart["quantity"] = existingCart["quantity"] + 1 || 1;
      cartClone.map(obj => [existingCart].find(o => o.id === obj.id) || obj);
  
      return setCartItem(cartClone);
    }
  
    cartClone.push({ ...product, quantity: 1 });
    return setCartItem(cartClone);
  };
  

const PRODUCTS = (currency) => gql`
{
  products {
    id
    title
    image_url
    price(currency: ${currency})
  },
  currency 
}
`;

const { loading, error, data } = useQuery(PRODUCTS( useDefault ? 'USD': selectedOption.value), {onCompleted: setProducts });


const handleChange = selectedOption => {
  setUseDefault(false);
  setSelectedOption(selectedOption);
  setDefaultSymbol(currencySymbols.filter( each => each.code === selectedOption.value)[0] || { code: selectedOption.value, symbol: selectedOption.value});
}

return (
  <div className="body">
    <header className="topnav">
      <h2> L U M I N</h2>
    </header>
    <main className="main">
      <section
        onClick={e => {
          if (
            e.target?.attributes?.getNamedItem("data-tag")?.value ===
            "add-cart-btn"
          ) {
            setOpenSidePanel(true);
          } else {
            setOpenSidePanel(false);
          }
        }}
        className="products-section row"
      >
        {loading ? (
          <p>loading...</p>
        ) : error ? (
          <p>
            Failed to load data,
            <small
              style={{ cursor: "pointer" }}
              onClick={() => window.location.reload()}
            >
              Click to refresh
            </small>
          </p>
        ) : (
          data.products.map((e, index) => (
            <div key={index} className="single-product">
              <div className="product-image-container">
                <img
                  className="product-image age-mgmt-img"
                  src={e.image_url}
                  alt="product"
                />
              </div>
              <h3 className="product-title">{e.title} </h3>
              <p className="single-product-price">
                From:{" "}
                <span>
                  {defaultSymbol.symbol} {e.price}.00
                </span>
              </p>

              <div className="action-buttons">
                <div
                  data-tag="add-cart-btn"
                  className="acn-bttn acn-bttn-2 add-complete-skincare-set-to-cart"
                  onClick={() => {
                    addToCart(e);
                    return setOpenSidePanel(true);
                  }}
                >
                  Add to Cart
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {!error && (
        <aside
          className={`right_nav_panel flex-col j-start ${
            openSidepanel ? "open" : ""
          }`}
          tabIndex="-1"
        >
          <Select
            className="select-handle"
            value={selectedOption}
            onChange={handleChange}
            options={
              data?.currency.length
                ? data.currency.map(e => ({ value: e, label: e }))
                : [{ value: "USD", label: "Dollar", symbol: "$" }]
            }
          />

          <div>
            <small style={{ margin: "10px" }}>
              Total Price: {defaultSymbol.symbol}{" "}
              {cart
                .map(a => {
                  const exists = data?.products.find(b => a.id === b.id);

                  if (exists) {
                    a.price = exists.price;
                  }

                  return a;
                })
                .reduce((acc, curr) => {
                  return acc + curr.quantity * curr.price;
                }, 0)}
              .00
            </small>
          </div>
          {cart
            .map(a => {
              const exists = data?.products.find(b => a.id === b.id);

              if (exists) {
                a.price = exists.price;
              }

              return a;
            })
            .map((e, index) => (
              <div key={index} className="react-cart-body">
                <div className="cart-item-list">
                  <div className="cart-item">
                    <div
                      style={{
                        overflow: "auto",
                        height: "20px",
                        width: "100%"
                      }}
                    >
                      <small
                        style={{ height: "20px" }}
                        className="product-title"
                      >
                        {e.title}{" "}
                      </small>
                      <span style={{ float: "right", height: "20px" }}>X</span>
                    </div>

                    <div className="quantity">
                      <div className="quantity-selector">
                        <span
                          onClick={() => removeFromCart(e)}
                          className="counter-action decrement"
                        >
                          -
                        </span>
                        <span className="counter-number counter">
                          {" "}
                          {e.quantity}{" "}
                        </span>
                        <span
                          onClick={() => addToCart(e)}
                          className="counter-action increment"
                        >
                          +
                        </span>
                      </div>

                      <div className="price">
                        {" "}
                        {defaultSymbol.symbol}
                        {e.price * e.quantity}.00
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

          <div className="as_nav flex-row j-start"></div>
        </aside>
      )}
    </main>
  </div>
);
;

}

export default App;
