import React, { Component } from 'react'
import {Link} from 'react-router-dom';
export default class Nav extends Component {
  render() {
    return (
      <div className="navbar">
        <ul className="navbar__list">
             <li className="list"><Link to="/">Pretrained Model</Link></li>
             <li className="list"><Link to="/">Tranfer Learning</Link></li>
             {/* <li className="list"><Link to="/transfer">Tranfer Learning</Link></li> */}
        </ul>
      </div>
    )
  }
}
