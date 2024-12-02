from flask import Flask, request, jsonify
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@127.0.0.1:3306/libraries'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

library_book = db.Table('joinlibrarybooks',
    db.Column('library_id', db.Integer, db.ForeignKey('library.library_id'), primary_key=True),
    db.Column('book_id', db.Integer, db.ForeignKey('book.book_id'), primary_key=True)
)

library_member = db.Table('joinlibrarymembers',     
    db.Column('library_id', db.Integer, db.ForeignKey('library.library_id'), primary_key=True),
    db.Column('member_id', db.Integer, db.ForeignKey('member.member_id'), primary_key=True)
)

class Library(db.Model):
    __tablename__ = 'library'
    library_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(20), nullable=False)
    books = db.relationship('Book', secondary=library_book, backref='libraries_list', lazy='dynamic')
    members = db.relationship('Member', secondary=library_member, back_populates='libraries',  lazy='dynamic')

class Book(db.Model):
    __tablename__ = 'book'
    book_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(50), nullable=False)
    author = db.Column(db.String(50), nullable=False)
    isbn = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='available')
    lent_to = db.Column(db.Integer, db.ForeignKey('member.member_id'))
    lent_date = db.Column(db.DateTime)
    ebook = db.relationship('Ebook', uselist=False, back_populates='book')

class Member(db.Model):
    __tablename__ = 'member'
    member_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    libraries = db.relationship('Library', secondary=library_member, back_populates='members', lazy='dynamic')

class Ebook(db.Model):
    __tablename__ = 'ebook'
    book_id = db.Column(db.Integer, db.ForeignKey('book.book_id'), primary_key=True, autoincrement=True)
    file_format = db.Column(db.String(25), nullable=False)
    book = db.relationship('Book', back_populates='ebook')

class BorrowedBook(db.Model):
    __tablename__ = 'borrowedbooks'
    borrow_id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('member.member_id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.book_id'), nullable=False)
    borrow_date = db.Column(db.Date, default=datetime.utcnow().date())
    book = db.relationship('Book', backref=db.backref('borrowed_books', lazy=True))
    member = db.relationship('Member', backref=db.backref('borrowed_books', lazy=True))

def to_dict(model):
    return {c.name: getattr(model, c.name) for c in model.__table__.columns}

def add_dict_method(cls):
    cls.as_dict = lambda self: to_dict(self)
    return cls

Library = add_dict_method(Library)
Book = add_dict_method(Book)
Member = add_dict_method(Member)
Ebook = add_dict_method(Ebook)

@app.route('/library', methods=['GET'])
def getLibrary():
    libraries = Library.query.all()
    return jsonify([lib.as_dict() for lib in libraries]), 200

@app.route('/library/<int:libraryID>', methods=['GET'])
def getLibraries(libraryID):
    lib = db.session.get(Library, libraryID)
    if lib:
        return jsonify(lib.as_dict()), 200
    return jsonify({'error': 'Library not found'}), 404

@app.route('/library', methods=['POST'])
def postLibrary():
    data = request.get_json()
    if not isinstance(data.get('name'), str):
        return jsonify({'error': 'Invalid name'}), 400
    if not isinstance(data.get('password'), str):
        return jsonify({'error': 'Invalid password'}), 400
    
    new_library = Library(name=data['name'], password=data['password'])
    db.session.add(new_library)
    db.session.commit()
    return jsonify(new_library.as_dict()), 201

@app.route('/library/<int:library_id>/members', methods=['POST'])
def add_member_to_library(library_id):
    library = db.session.get(Library, library_id)
    if not library:
        return jsonify({"error": "Library not found"}), 404
    data = request.get_json()
    if not isinstance(data.get('name'), str):
        return jsonify({'error': 'Invalid member name'}), 400
    new_member = Member(name=data['name'])
    library.members.append(new_member)
    db.session.commit()
    return jsonify(new_member.as_dict()), 201

@app.route('/library/<int:library_id>/members/<int:member_id>', methods=['DELETE'])
def remove_member_from_library(library_id, member_id):
    library = db.session.get(Library, library_id)
    if not library:
        return jsonify({"error": "Library not found"}), 404
    member = db.session.get(Member, member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    if member not in library.members:
        return jsonify({'error': 'Member does not belong to this library'}), 400
    library.members.remove(member)  # Correctly remove the member from the library
    db.session.commit()
    return '', 204

@app.route('/library/<int:library_id>/members', methods=['GET'])
def get_members_from_library(library_id):
    library = db.session.get(Library, library_id)
    if not library:
        return jsonify({'error': 'Library not found'}), 404
    members = library.members.all()  # Fetch members from the library
    return jsonify([member.as_dict() for member in members]), 200


@app.route('/library/<int:library_id>/members/<int:member_id>', methods=['GET'])
def get_member_from_library(library_id, member_id):
    library = db.session.get(Library, library_id)
    if not library:
        return jsonify({'error': 'Library not found'}), 404
    member = Member.query.filter(Member.libraries.any(library_id=library_id), Member.member_id == member_id).first()
    if member:
        return jsonify(member.as_dict()), 200
    return jsonify({'error': 'Member not found'}), 404



@app.route('/library/<int:library_id>/books', methods=['POST'])
@cross_origin()
def add_book_to_library(library_id):
    library = db.session.get(Library, library_id)
    if not library:
        return jsonify({"error": "Library not found"}), 404
    data = request.get_json()
    if not all(field in data for field in ['title', 'author', 'isbn']):
        return jsonify({'error': 'Missing required book fields'}), 400

    title = data['title']
    author = data['author']
    isbn = data['isbn']
    file_format = data.get('file_format', None) 

    new_book = Book(title=title, author=author, isbn=isbn)

    if file_format:
        ebook = Ebook(file_format=file_format)
        new_book.ebook = ebook
    library.books.append(new_book)
    db.session.commit()
    return jsonify(new_book.as_dict()), 201

@app.route('/library/<int:libraryID>', methods=['PUT'])
def updateLibrary(libraryID):
    lib = db.session.get(Library, libraryID)
    if not lib:
        return jsonify({'error': 'Library not found'}), 404
    
    update_data = request.get_json()
    if 'name' in update_data and not isinstance(update_data.get('name'), str):
        return jsonify({'error': 'Invalid name'}), 400
    if 'password' in update_data and not isinstance(update_data.get('password'), str):
        return jsonify({'error': 'Invalid password'}), 400

    if 'name' in update_data:
        lib.name = update_data['name']
    if 'password' in update_data:
        lib.password = update_data['password']
    db.session.commit()
    return jsonify(lib.as_dict()), 200

@app.route('/library/<int:libraryID>', methods=['DELETE'])
def deleteLibrary(libraryID):
    lib = db.session.get(Library, libraryID)
    if lib:
        db.session.delete(lib)
        db.session.commit()
        return '', 204
    return jsonify({'error': 'Library not found'}), 404

# @app.route('/books', methods=['GET'])
# def get_books():
#     books = Book.query.all()
#     return jsonify([book.as_dict() for book in books]), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    library_id = data.get('libraryId')
    password = data.get('password')
    if not library_id or not password:
        return jsonify({'success': False, 'message' : 'Library ID and password are required'}), 400
    library = Library.query.filter_by(library_id=library_id, password=password).first()
    if library:
        return jsonify({'success': True, 'libraryId' : library.library_id}), 200
    else:
        return jsonify({'success': False, 'message': 'Invalid Library ID or password'}), 401

@app.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = db.session.get(Book, book_id)
    if book:
        return jsonify(book.as_dict()), 200
    return jsonify({'error': 'Book not found'}), 404

@app.route('/library/<int:library_id>/books', methods=['GET'])
def get_books(library_id):
    books = db.session.query(Book).join(library_book).filter(library_book.c.library_id == library_id).all()
    if not books:
        return jsonify({'error': 'No books found for this library'}), 404

    return jsonify([book.as_dict() for book in books]), 200



@app.route('/books', methods=['POST'])
def add_book():
    data = request.get_json()
    new_book = Book(
        title=data['title'],
        author=data['author'],
        isbn=data['isbn']
    )
    if data.get('file_format'):
        ebook = Ebook(file_format=data['file_format'])
        new_book.ebook = ebook
    db.session.add(new_book)
    db.session.commit()
    return jsonify(new_book.as_dict()), 201

@app.route('/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    book = db.session.get(Book, book_id)
    if book:
        data = request.get_json()
        book.title = data.get('title', book.title)
        book.author = data.get('author', book.author)
        book.isbn = data.get('isbn', book.isbn)
        db.session.commit()
        return jsonify(book.as_dict()), 200
    return jsonify({'error': 'Book not found'}), 404

@app.route('/library/<int:library_id>/books/<int:book_id>', methods=['DELETE'])
def delete_book(library_id, book_id):
    try:
        book = db.session.query(Book).join(library_book).filter(library_book.c.library_id == library_id, Book.book_id == book_id).first()    
        if not book:
            return {"error": "Book not found"}, 404
        
        db.session.delete(book)
        db.session.commit()
        return {"message": "Book deleted successfully"}, 200
    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/members/<int:member_id>', methods=['GET'])
def get_member(member_id):
    member = db.session.get(Member, member_id)
    if member:
        return jsonify(member.as_dict()), 200
    return jsonify({'error': 'Member not found'}), 404

@app.route('/members', methods=['POST'])
def add_member():
    data = request.get_json()
    new_member = Member(name=data['name'])
    db.session.add(new_member)
    db.session.commit()
    return jsonify(new_member.as_dict()), 201

@app.route('/members/<int:member_id>', methods=['PUT'])
def update_member(member_id):
    member = db.session.get(Member, member_id)
    if member:
        data = request.get_json()
        member.name = data.get('name', member.name)
        db.session.commit()
        return jsonify(member.as_dict()), 200
    return jsonify({'error': 'Member not found'}), 404

@app.route('/members/<int:member_id>', methods=['DELETE'])
def delete_member(member_id):
    member = db.session.get(Member, member_id)
    if member:
        db.session.delete(member)
        db.session.commit()
        return '', 204
    return jsonify({'error': 'Member not found'}), 404

@app.route('/library/<int:library_id>/lend', methods=['POST'])
def lend_book(library_id):
    data = request.get_json()
    book_id = data.get('book_id')
    member_id = data.get('member_id')

    book = db.session.query(Book).join(library_book).filter(library_book.c.library_id == library_id, Book.book_id == book_id).first()
    member = db.session.query(Member).join(library_member).filter(library_member.c.library_id == library_id, Member.member_id == member_id).first()

    if not book or not member:
        return jsonify({'error': 'Book or member not found in this library'}), 404
    
    # Check if the book is already borrowed
    if book.status == 'borrowed':
        return jsonify({'error': 'Book is already borrowed'}), 400

    # Update the book status to 'borrowed' and add a record in BorrowedBook
    book.status = 'borrowed'
    book.lent_to = member_id
    book.lent_date = datetime.utcnow()

    borrowed_book = BorrowedBook(book_id=book_id, member_id=member_id, borrow_date=datetime.utcnow())
    db.session.add(borrowed_book)
    db.session.commit()

    return jsonify({'message': 'Book lent successfully', 'book': book.as_dict()}), 200

@app.route('/library/<int:library_id>/return', methods=['POST'])
def return_book(library_id):
    
    data = request.get_json()
    book_id = data.get('book_id')
    member_id = data.get('member_id')
    
    book = db.session.query(Book).join(library_book).filter(library_book.c.library_id == library_id, Book.book_id == book_id).first()
    member = db.session.query(Member).join(library_member).filter(library_member.c.library_id == library_id, Member.member_id == member_id).first()
    
    if not book or not member:
        return jsonify({'error': 'Book or member not found in this library'}), 404
    
    book.status = 'available'
    book.lent_to = None
    book.lent_date = None
    db.session.commit()
    
    borrowed_book = db.session.query(BorrowedBook).filter_by(book_id=book_id, member_id=member_id).first()
    if borrowed_book:
        db.session.delete(borrowed_book)
        db.session.commit()
        
        return jsonify({'message': 'Book returned successfully', 'book': book.as_dict()}), 200
    
if __name__ == '__main__':
    app.run(debug=True)
