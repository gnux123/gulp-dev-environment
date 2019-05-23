class Index extends React.Component {
    constructor(props){
        super(props);
        this.states = {};
    }

    render(){
        return(
            <h1>Hello!! World</h1>
        );
    }
}

ReactDOM.render(<Index />, document.getElementById("app-root"));