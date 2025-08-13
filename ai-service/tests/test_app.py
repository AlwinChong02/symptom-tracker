import json
import unittest
from app import app

class SymptomTrackerTestCase(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_initial_question(self):
        """Test that the initial question is returned with no history."""
        response = self.app.post('/api/symptom-tracker',
                                 data=json.dumps({'history': []}),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('question', data)
        self.assertIn('options', data)
        self.assertFalse(data['is_final'])

    def test_max_questions_reached(self):
        """Test that a final analysis is forced after 10 questions."""
        # Create a dummy history with 10 entries
        history = [{'question': f'Q{i}', 'answer': f'A{i}'} for i in range(10)]
        response = self.app.post('/api/symptom-tracker',
                                 data=json.dumps({'history': history}),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('analysis', data)
        self.assertTrue(data['is_final'])

if __name__ == '__main__':
    unittest.main()
