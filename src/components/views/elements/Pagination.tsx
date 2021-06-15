import React from 'react';
import PropTypes, { number } from 'prop-types';

const defaultProps = {
    initialPage: 1,
    pageSize: 20,
    onChangePage: (pageNumber) =>  number,
    numOfTotalRecords: 1,
}

interface IState {
    pager: any
}

class Pagination extends React.Component<typeof defaultProps, IState> {

    static propTypes = {
        numOfTotalRecords: PropTypes.number,
        items: PropTypes.array,
        onChangePage: PropTypes.func.isRequired,
        initialPage: PropTypes.number,
        pageSize: PropTypes.number
    }
    constructor(props) {
        super(props);
        this.state = { pager: {} };
    }

    componentWillMount() {
        // set page if numOfTotalRecords array isn't empty
        if (this.props.numOfTotalRecords && this.props.numOfTotalRecords) {
            this.setPage(this.props.initialPage);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // reset page if numOfTotalRecords array has changed
        if (this.props.numOfTotalRecords !== prevProps.numOfTotalRecords) {
            this.setPage(this.props.initialPage);
        }
    }

    setPage(page) {
        console.log(`Total number of records is, ${this.props.numOfTotalRecords}`);
        const { numOfTotalRecords, pageSize } = this.props;
        let pager = this.state.pager;

        if (page < 1 || page > pager.totalPages) {
            return;
        }

        // get new pager object for specified page
        pager = this.getPager(numOfTotalRecords, page, pageSize);

        // update state
        this.setState({ pager: pager });

        // call change page function in parent component
        this.props.onChangePage(pager.currentPage);
    }

    getPager(totalItems, currentPage, pageSize) {
        // default to first page
        currentPage = currentPage || 1;

        // default page size is 20
        pageSize = pageSize || 20;

        // calculate total pages
        let totalPages = Math.ceil(totalItems / pageSize);

        let startPage, endPage;
        if (totalPages <= 10) {
            // less than 10 total pages so show all
            startPage = 1;
            endPage = totalPages;
        } else {
            // more than 10 total pages so calculate start and end pages
            if (currentPage <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }

        // calculate start and end item indexes
        let startIndex = (currentPage - 1) * pageSize;
        let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

        // create an array of pages to in the pager control
        let pages = [...Array((endPage + 1) - startPage).keys()].map(i => startPage + i);

        // return object with all pager properties required by the view
        return {
            totalItems: totalItems,
            currentPage: currentPage,
            pageSize: pageSize,
            totalPages: totalPages,
            startPage: startPage,
            endPage: endPage,
            startIndex: startIndex,
            endIndex: endIndex,
            pages: pages
        };
    }

    render() {
        let pager = this.state.pager;

        if (!pager.pages || pager.pages.length <= 1) {
            // don't display pager if there is only 1 page
            return null;
        }

        return (
            <span className="mx_Pagination">
                <li style={{ marginRight: '20px' }}>
                    Displaying records {pager.startIndex + 1} - {pager.endIndex + 1} of {this.props.numOfTotalRecords}.
                </li>
                <li className={pager.currentPage === 1 ? 'disabled' : ''} title="First">
                    <a onClick={() => this.setPage(1)}>&#171;</a>
                </li>
                <li className={pager.currentPage === 1 ? 'disabled' : ''} title="Previous">
                    <a onClick={() => this.setPage(pager.currentPage - 1)}>&#8249;</a>
                </li>
                {pager.pages.map((page, index) =>
                    <li key={index} className={pager.currentPage === page ? 'active' : ''}>
                        <a onClick={() => this.setPage(page)}>{page}</a>
                    </li>
                )}
                <li className={pager.currentPage === pager.totalPages ? 'disabled' : ''} title="Next">
                    <a onClick={() => this.setPage(pager.currentPage + 1)}>&#8250;</a>
                </li>
                <li className={pager.currentPage === pager.totalPages ? 'disabled' : ''} title="Last">
                    <a onClick={() => this.setPage(pager.totalPages)}>&#187;</a>
                </li>
            </span>
        );
    }
}

export default Pagination;
