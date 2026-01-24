const pool = require('../config/db');

async function submitFeedback(req, res) {
	try {
		const { referenceId, rating, comment = '' } = req.body;

		  if (!referenceId || !rating) {
    return res.status(400).json({ message: "referenceId and rating are required" });
  }

		// find the service request
		const [requests] = await pool.query(
			'SELECT id, customer_id FROM service_requests WHERE referenceId = ? LIMIT 1',
			[referenceId]
		);

		if (!requests || requests.length === 0) {
			return res.status(404).json({ message: 'Service request not found for provided referenceId' });
		}

		const reqRow = requests[0];

		// ensure one feedback per request
		const [existing] = await pool.query('SELECT id FROM feedback WHERE request_id = ? LIMIT 1', [reqRow.id]);
		if (existing && existing.length > 0) {
			return res.status(409).json({ message: 'Feedback already exists for this service request' });
		}

		const numericRating = Number(rating);
		if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
			return res.status(400).json({ message: 'rating must be a number between 1 and 5' });
		}

		// insert feedback
		const sql = `INSERT INTO feedback (request_id, customer_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())`;
		const params = [reqRow.id, reqRow.customer_id, numericRating, comment];
		await pool.query(sql, params);

		return res.status(201).json({ message: 'Feedback submitted' });
	} catch (err) {
		console.error('submitFeedback error', err);
		return res.status(500).json({ message: 'Server error' });
	}
}

async function getAllFeedback(req, res) {
	try {
		const sql = `
			SELECT f.id, f.request_id, sr.referenceId AS referenceId, f.customer_id, f.rating, f.comment, f.created_at
			FROM feedback f
			JOIN service_requests sr ON f.request_id = sr.id
			ORDER BY f.created_at DESC
		`;
		const [rows] = await pool.query(sql);
		return res.json(rows);
	} catch (err) {
		console.error('getAllFeedback error', err);
		return res.status(500).json({ message: 'Server error' });
	}
}

async function deleteFeedback(req, res) {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM feedback WHERE id = ?', [id]);
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Feedback not found' });
  return res.json({ message: 'Feedback deleted successfully' });
}

module.exports = { submitFeedback, getAllFeedback, deleteFeedback };