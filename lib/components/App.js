import { h } from 'hyperapp';
import ClearInputBtn from './ClearInputBtn';
import EmptyListElement from './EmptyListElement';
import SelectInput from './SelectInput';
import Input from './Input';
import Dropdown from './Dropdown';
import UnorderedList from './UnorderedList';
import ListElement from './ListElement';
import Spinner from './Spinner';

const App = () => (state, actions) => {
    // State
    const list = state.filtered;

    // Computed
    const showClearBtn = (state.showClearBtn && state.inputVal && state.inputRef !== null);
    const showSpinner  = (state.showSpinner && state.isFetching && state.inputRef !== null);
    const showEmptyMsg = (state.selectMode && list.length < 1);

    const clearInput = () => {
        actions.setInputVal('');
        actions.focusInputAndHideDropdown();
    };

    return h('div', { class: state.divClass },
        h('div', { style: { position: 'relative' } },
            state.selectMode
                ? SelectInput()
                : Input()
            ,

            showClearBtn &&
                ClearInputBtn({ inputRef: state.inputRef, clearInput })
            ,

            showSpinner &&
                Spinner({
                    inputRef: state.inputRef,
                    setTimer: actions.setTimer,
                    clearTimer: actions.clearTimer
                })
            ,
        ),

        state.showDropdown &&
            Dropdown({ dropdownClass: state.dropdownClass, isSelectMode: state.selectMode },
                UnorderedList({ ulClass: state.ulClass },
                    showEmptyMsg
                        ? EmptyListElement({ emptyMsg: state.emptyMsg })
                        : list.map((c, i) => {
                            return ListElement({
                                liClass: state.liClass,
                                choice: c,
                                isSelected: state.selected === i,
                                inputVal: state.inputVal,
                                renderItem: state.renderItem,
                                onmousedown: actions.onListElementMouseDown
                            });
                        })
                    ,
                )
            )
        ,
    );
};

export default App;