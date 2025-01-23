// /client/src/components/PaginationControls.js
import { Button, Form, Pagination } from 'react-bootstrap';

const PaginationControls = ({ pagination, setPagination }) => {
  const handleItemsPerPageChange = (e) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: Number(e.target.value),
      currentPage: 1 // Reset to first page
    }));
  };

  return (
    <div className="d-flex justify-content-between align-items-center mt-4">
      <Form.Select 
        style={{ width: '120px' }} 
        value={pagination.itemsPerPage}
        onChange={handleItemsPerPageChange}
      >
        <option value="5">5 per page</option>
        <option value="10">10 per page</option>
        <option value="20">20 per page</option>
        <option value="50">50 per page</option>
      </Form.Select>

      <Pagination>
        <Pagination.Prev 
          disabled={pagination.currentPage === 1}
          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
        />
        <Pagination.Item active>{pagination.currentPage}</Pagination.Item>
        <Pagination.Next 
          disabled={pagination.currentPage === pagination.totalPages}
          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
        />
      </Pagination>

      <div>Total: {pagination.totalItems}</div>
    </div>
  );
};

export default PaginationControls;