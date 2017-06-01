<div className="content-section-a" style={{backgroundColor: '#fff'}}>
    <div className="container">
        <div className="row">
            <div className="clearfix"></div>
            <h1 className="section-heading">
                {this.props.firstName} {this.props.lastName}
            </h1>
            <p>{this.props.summary}</p>
        </div>

        <div className="row">
            <h2>Experience</h2>

            {this.props.positions.values.map(function (p, i) {
                let key = 'position-' + i
                return <div>
                    <h3>{p.title} @ {p.company.name}</h3>
                    <div key={key}>
                        {(p.summary || '').split('\n').map(function (v, j) {
                            return <div key={key + '-' + j}>{v}</div>
                        })}
                    </div>
                </div>
            })}
        </div>
    </div>
</div>
