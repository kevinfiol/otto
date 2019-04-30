import { h } from 'hyperapp';
import SelectInput from './SelectInput';
import Input from './Input';
import Dropdown from './Dropdown';
import UnorderedList from './UnorderedList';
import ListElement from './ListElement';
import Spinner from './Spinner';

const App = () => (state, actions) => {
    // Choices List
    const list = state.selectMode ? state.all : state.filtered;

    // List Element Action
    const onListElementMouseDown = actions.onListElementMouseDown;

    return h('div', { class: state.divClass },
        h('div', { style: { position: 'relative' } },
            (state.isFetching && state.inputRef !== null)
                ? Spinner({ key: 'spinner', inputRef: state.inputRef })
                : null
            ,

            state.selectMode
                ? SelectInput({ key: 'input' })
                : Input({ key: 'input' })
            ,
        ),

        state.showDropdown
            ? Dropdown({ dropdownClass: state.dropdownClass, isSelectMode: state.selectMode },
                UnorderedList({ ulClass: state.ulClass },
                    list.map((c, i) => {
                        return ListElement({
                            liClass: state.liClass,
                            choice: c,
                            isSelected: state.selected === i,
                            inputVal: state.inputVal,
                            renderItem: state.renderItem,
                            onmousedown: onListElementMouseDown
                        });
                    })
                )
            )
            : null
        ,
    );
};

export default App;