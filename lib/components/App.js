import { h } from 'hyperapp';
import Input from './Input';
import Dropdown from './Dropdown';

const App = () => state => {
    return h('div', {}, [
        Input(),
        state.showDropdown ? Dropdown() : null
    ]);
};

export default App;