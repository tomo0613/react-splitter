const htmlSplitter = React.createClass({
    displayName: 'htmlSplitter',
    propTypes: {
        id: React.PropTypes.string.isRequired,
        orient: React.PropTypes.string,
        collapse: React.PropTypes.string,
        lineSize: React.PropTypes.number
    },
    getDefaultProps: function() {
        return {
            orient: 'vertical',
            lineSize: 5
        };
    },
    getInitialState: function() {
        const vertical = this.props.orient === 'vertical';
        return {
            initialStyle: {
                width: vertical ? (this.props.lineSize + 'px') : '100%',
                height: vertical ? '100%' : (this.props.lineSize + 'px'),
                cursor: vertical ? 'ew-resize' : 'ns-resize'
            }
        };
    },
    render: function() {
        return React.DOM.div({
            id: this.props.id,
            className: 'htmlSplitter',
            style: this.state.initialStyle
        }, null);
    },
    componentDidMount: function() {
        const props = this.props;
        const thisNode = ReactDOM.findDOMNode(this);
        const parentNode = thisNode.parentNode;
        const siblingNodeBefore = thisNode.previousSibling;
        const siblingNodeAfter = thisNode.nextSibling;
        const boundaries = parentNode.getBoundingClientRect();
        const maxSize = props.orient === 'vertical' ? boundaries.width : boundaries.height;

        siblingNodeBefore.hide = display(siblingNodeBefore, 'none');
        siblingNodeBefore.show = display(siblingNodeBefore, 'flex');
        siblingNodeAfter.hide = display(siblingNodeAfter, 'none');
        siblingNodeAfter.show = display(siblingNodeAfter, 'flex');

        thisNode.addEventListener('mousedown', setListeners);
        thisNode.addEventListener('dblclick', toggleCollapse);

        function setListeners() {
            parentNode.addEventListener('mouseup', removeListeners);
            parentNode.addEventListener('mouseleave', removeListeners);
            parentNode.addEventListener('mousemove', mouseMoveAction);
            setTextSelection('none');
        }
        function removeListeners() {
            parentNode.removeEventListener('mouseup', removeListeners);
            parentNode.removeEventListener('mouseleave', removeListeners);
            parentNode.removeEventListener('mousemove', mouseMoveAction);
            setTextSelection('auto');
        }
        function mouseMoveAction(e) {
            const cssProps = {};
            const space = {};
            const mousePos = props.orient === 'vertical' ? e.clientX : e.clientY;
            const borderPos = props.orient === 'vertical' ? boundaries.left : boundaries.top;

            space.before = mousePos - borderPos;
            space.after = maxSize - (mousePos - borderPos);
            if (!collapse(space)) {
                siblingNodeBefore.style['flex-basis'] = space.before + 'px';
                siblingNodeAfter.style['flex-basis'] = space.after + 'px';
            }
        }
        function collapse(space, force) {
            if (!props.collapse) {
                return false;
            }
            const primaryNode = props.collapse === 'before' ? siblingNodeBefore : siblingNodeAfter;
            const secondaryNode = props.collapse === 'before' ? siblingNodeAfter : siblingNodeBefore;
            const sizeProp = props.orient === 'vertical' ? 'width' : 'height';
            const minSize = 50 /*Number(node.style['min-' + sizeProp])*/;
            if (space[props.collapse] < minSize) {
                primaryNode.hide() && (secondaryNode.style['flex-basis'] = maxSize + 'px');
                return true;
            } else {
                primaryNode.show();
                return false;
            }
        }
        function toggleCollapse() {
            if (siblingNodeBefore.style.display === 'none' || siblingNodeAfter.style.display === 'none') {
                collapse({
                    before: Number(siblingNodeBefore.style['flex-basis']) || maxSize / 2,
                    after: Number(siblingNodeAfter.style['flex-basis']) || maxSize / 2
                });
            } else {
                collapse({before: 0, after: 0});
            }
        }
        function display(node, propValue) {
            return () => {
                if (node.style.display === propValue) {
                    return false;
                }
                node.style.display = propValue;
                return true;
            };
        }
        function setTextSelection(value) {
            ['-ms-', '-moz-', ''].forEach((prefix) => parentNode.style[prefix + 'user-select'] = value);
        }
    }
});

var MainElement = React.createClass({
    displayName: 'MainElement',
    render: function() {
        return React.DOM.div({className: 'containerDiv'},
            React.DOM.div(
                {
                    className: 'elBefore'
                },
                'asd asd'
            ),
            React.createElement(htmlSplitter,
                {
                    id: 's1',
                    orient: 'vertical',
                    collapse: 'before'
                }
            ),
            React.DOM.div(
                {
                    className: 'elAfter'
                },
                null
            )
        );
    }
});

ReactDOM.render(React.createElement(MainElement), document.getElementById('rootElement'));
