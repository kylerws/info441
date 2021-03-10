import React from 'react';
import{NavLink} from 'react-router-dom';

function AboutNav(props) {
  return (
    <nav id="aboutLinks">      
      <ul className="list-unstyled">
        <li><NavLink to="/Teams" activeClassName="activeLink">Teams</NavLink></li>
      </ul>
    </nav>
  );
}

export default AboutNav;