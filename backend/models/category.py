from backend.models import db

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255))
    icon = db.Column(db.String(10), default='📚', nullable=False)  # For emoji icons
    is_active = db.Column(db.Boolean, default=True, nullable=False)  # Active/Inactive status
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=False)
    admin = db.relationship('Admin', backref=db.backref('categories_created', lazy=True))

    def __repr__(self):
        return f'<Category {self.name}>'