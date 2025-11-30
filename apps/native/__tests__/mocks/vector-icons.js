// @expo/vector-icons mock
const React = require('react');

const createIconComponent = (name) => (props) => {
  return React.createElement(name, props);
};

module.exports = {
  Ionicons: createIconComponent('Ionicons'),
  MaterialIcons: createIconComponent('MaterialIcons'),
  FontAwesome: createIconComponent('FontAwesome'),
  Feather: createIconComponent('Feather'),
  AntDesign: createIconComponent('AntDesign'),
};
