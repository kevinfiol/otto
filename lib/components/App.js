import { h } from 'hyperapp';
import SelectInput from './SelectInput';
import Input from './Input';
import Dropdown from './Dropdown';
import UnorderedList from './UnorderedList';

const App = () => state => {
    return h('div', { class: state.divClass }, [
        state.selectMode
            ? SelectInput()
            : Input()
        ,

        state.showDropdown
            ? Dropdown({ dropdownClass: state.dropdownClass, width: state.width },
                UnorderedList({
                    ulClass: state.ulClass,
                    list: state.filtered,
                    selected: state.selected,
                    emptyMsg: state.emptyMsg
                })
            )
            : null
        ,
    ]);
};

export default App;