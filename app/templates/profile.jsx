<div className="container content-section-a">
    <div className="container">
        <div className="row">
            <div className="clearfix"></div>
            <div id="app"></div>
        </div>
    </div>

    <script src="https://www.gstatic.com/firebasejs/4.1.2/firebase.js"></script>
    <script src="https://apis.google.com/js/api.js"></script>
    <script dangerouslySetInnerHTML={{__html: "window.__config = " + JSON.stringify(this.props)}}></script>
    <script src={this.props.asset("/build/lib.js")}></script>
    <script src={this.props.asset("/build/index.js")}></script>
</div>
