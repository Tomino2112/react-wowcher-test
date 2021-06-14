import React, { Component } from "react";

import "./App.css";

const formatNumber = (number) => new Intl.NumberFormat("en", { minimumFractionDigits: 2 }).format(number);
const getBranchData = (branchId) => fetch(`/api/branch${branchId}.json`)
  .then(response => response.json());

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      productSales: [],
      filter: ''
    };

    this.handleFilterChange = this.handleFilterChange.bind(this);
  }

  async componentDidMount() {
    const salesData = await Promise.all([getBranchData(1), getBranchData(2), getBranchData(3)]);
    const allProducts = [...salesData[0].products, ...salesData[1].products, ...salesData[2].products];    
    const deDupedProducts = allProducts.reduce((acc, next) => {
      if (next.id in acc) { 
        acc[next.id].sold += next.sold;               
      } else {
        acc[next.id] = {
          revenue: 0,
          ...next
        };
      }      

      acc[next.id].revenue += next.unitPrice * next.sold;

      return acc;
    }, {});

    const productSales = Object.values(deDupedProducts).sort((a, b) => a.name > b.name ? 1 : -1);

    this.setState({
      loading: false,
      productSales 
    });
  }

  handleFilterChange(event) {
    this.setState({
      filter: event.target.value
    });
  }

  render() {
    if (this.state.loading) {
      return "Loading..."
    }

    const filteredProductSales = this.state.productSales.filter(product => product.name.toLowerCase().includes(this.state.filter.toLowerCase()));

    return (
      <div className="product-list">
        <label>Search Products</label>
        <input type="text" onChange={this.handleFilterChange} />
        
        <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {filteredProductSales.map(product => (
            <tr key={product.name}>
              <td>{product.name}</td>
              <td>{formatNumber(product.revenue)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>{formatNumber(filteredProductSales.reduce((acc, next) => acc += next.revenue, 0))}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
  }
}

export default App;
