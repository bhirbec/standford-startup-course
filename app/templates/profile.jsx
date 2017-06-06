<div className="container content-section-a">
    <div className="container">
        <div className="row">
            <div className="clearfix"></div>
            <h1 className="section-heading">
                {this.props['google-profile'].name}
            </h1>
        </div>
        <div id="app"></div>
    </div>
    <script src={this.props.asset("/build/lib.js")}></script>
    <script src={this.props.asset("/build/index.js")}></script>
</div>
