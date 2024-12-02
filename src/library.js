import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Library = ({ showErrorToast, showSuccessToast }) => {
	const [libraryName, setLibraryName] = useState("");
	const [libraryId, setLibraryId] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [modalType, setModalType] = useState("");
	const [memberInputs, setMemberInputs] = useState({ memberName: "" });
	const [memberRemovalInputs, setMemberRemovalInputs] = useState({ memberId: "" });
	const [bookInputs, setBookInputs] = useState({ title: "", author: "", isbn: "" });
	const [bookRemovalInputs, setBookRemovalInputs] = useState({ bookId: "" });
	const [lendBookInputs, setLendBookInputs] = useState({ memberId: "", bookId: "" });
	const [returnBookInputs, setReturnBookInputs] = useState({ memberId: "", bookId: "" });

	const navigate = useNavigate();

	// getting the library id
	useEffect(() => {
		const libraryIdFromUrl = new URLSearchParams(window.location.search).get("libraryId");
		setLibraryId(libraryIdFromUrl);

		if (libraryIdFromUrl) {
			fetch(`http://127.0.0.1:5000/library/${libraryIdFromUrl}`)
				.then((response) => response.json())
				.then((data) => {
					if (data.error) {
						setLibraryName("Library not found");
					} else {
						setLibraryName(data.name);
					}
				})
				.catch((error) => {
					console.error("Error fetching library data:", error);
					setLibraryName("Error fetching library data");
				});
		} else {
			setLibraryName("No Library ID provided");
		}
	}, [libraryId]);

	const openModal = (modal) => {
		setModalType(modal);
		setShowModal(true);
	};

	const handleAddMember = () => {
		const { memberName } = memberInputs;
		if (!memberName || !libraryId) {
			showErrorToast("Member name and library ID are required.");
			return;
		}
		fetch(`http://127.0.0.1:5000/library/${libraryId}/members`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name: memberName }),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					showErrorToast(data.error);
				} else {
					showSuccessToast(`Member added successfully! The member ID is ${data.member_id}. Please keep for future reference.`);
					setShowModal(false);
					setMemberInputs({ memberName: "" });
				}
			})
			.catch((error) => {
				console.error("Error adding member:", error);
				showErrorToast("An error occurred while adding the member. Please try again.");
			});
	};

	const handleRemoveMember = () => {
		const { memberId } = memberRemovalInputs;
		if (!memberId || !libraryId) {
			showErrorToast("Member ID and library ID are required.");
			return;
		}
		fetch(`http://127.0.0.1:5000/library/${libraryId}/members/${memberId}`, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
		})
			.then((response) => {
				if (!response.ok) {
					return response.json().then((data) => showErrorToast(data.error || "Failed to remove member"));
				}
				showSuccessToast("Member removed successfully!");
				setShowModal(false);
				setMemberRemovalInputs({ memberId: "" });
			})
			.catch((error) => {
				console.error("Error removing member:", error);
				showErrorToast("An error occurred while removing the member.");
			});
	};

	// function to go to the view members page
	const viewMemberButton = () => {
		if (libraryId) {
			navigate(`/viewMembers?libraryId=${libraryId}`);
		} else {
			showErrorToast("Library ID is not available");
		}
	};

	const handleAddBook = () => {
		const { title, author, isbn } = bookInputs;
		if (!title || !author|| !isbn) {
			showErrorToast("All fields are required to add a book.");
			return;
		}
		if (libraryId) {
			fetch(`http://127.0.0.1:5000/library/${libraryId}/books`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ title, author, isbn }),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.error) {
						showErrorToast(data.error);
					} else {
						showSuccessToast(`Book added successfully! Book ID: ${data.book_id}.`);
						setShowModal(false);
						setBookInputs({ title: "", author: "", isbn: "" });
					}
				})
				.catch((error) => {
					console.error("Error adding book:", error);
					showErrorToast("An error occurred while adding the book. Please try again.");
				});
		} else {
			showErrorToast("Library ID is not available.");
		}
	};

	const handleRemoveBook = () => {
		const { bookId } = bookRemovalInputs;
		if (!bookId || !libraryId) {
			showErrorToast("Book ID and library ID are required.");
			return;
		}
		fetch(`http://127.0.0.1:5000/library/${libraryId}/books/${bookId}`, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
		})
			.then((response) => {
				if (response.status === 404) {
					showErrorToast("Book not found.");
				} else if (!response.ok) {
					response.json().then((data) => showErrorToast(data.error || "Failed to remove book"));
				} else {
					showSuccessToast("Book removed successfully!");
					setShowModal(false);
					setBookRemovalInputs({ bookId: "" });
				}
			})
			.catch((error) => {
				console.error("Error removing book:", error);
				showErrorToast("An error occurred while removing the book.");
			});
	};

	// function to go to the view books page
	const viewBooksButton = () => {
		if (libraryId) {
			navigate(`/viewBooks?libraryId=${libraryId}`);
		} else {
			showErrorToast("Library ID is not available");
		}
	};

	const lendBook = () => {
		const { memberId, bookId } = lendBookInputs;
		if (!memberId || !bookId) {
			showErrorToast("Both Member ID and Book ID are required.");
			return;
		}
		if (libraryId) {
			fetch(`http://127.0.0.1:5000/library/${libraryId}/lend`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ book_id: bookId, member_id: memberId }),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.error) {
						showErrorToast(data.error);
					} else {
						showSuccessToast("Book lent successfully.");
						setShowModal(false);
						setLendBookInputs({ memberId: "", bookId: "" });
					}
				})
				.catch((error) => {
					console.error("Error lending book:", error);
					showErrorToast("An error occurred while lending the book.");
				});
		} else {
			showErrorToast("Library ID is not available.");
		}
	};

	const returnBook = () => {
		const { memberId, bookId } = returnBookInputs;
		if (!memberId || !bookId) {
			showErrorToast("Both Member ID and Book ID are required.");
			return;
		}
		if (libraryId) {
			fetch(`http://127.0.0.1:5000/library/${libraryId}/return`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ book_id: bookId, member_id: memberId  })
			})
			
				.then((response) => response.json())
				.then((data) => {
					if (data.error) {
						showErrorToast(data.error);
					} else {
						showSuccessToast("Book returned successfully.");
						setShowModal(false);
						setReturnBookInputs({ memberId: "", bookId: "" });
					}
				})
				.catch((error) => {
					console.error("Error returning book:", error);
					showErrorToast("An error occurred while returning the book.");
				});
		} else {
			showErrorToast("Library ID is not available.");
		}
	};

	return (
		<div className="container my-5">
			<div className="custom-container">
				<h1 className="text-center mb-4 newams">{libraryName}</h1>
				<div className="row g-4">
					<div className="col-md-3">
						<button onClick={() => openModal("addMember")} className="square">Add Member</button>
					</div>
					<div className="col-md-3">
						<button onClick={() => openModal("removeMember")} className="square">Remove Member</button>
					</div>
					<div className="col-md-3">
						<button onClick={viewMemberButton} className="square">View Members</button>
					</div>
					<div className="col-md-3">
						<button onClick={() => openModal("addBook")} className="square">Add Book</button>
					</div>
					<div className="col-md-3">
						<button onClick={() => openModal("removeBook")} className="square">Remove Book</button>
					</div>
					<div className="col-md-3">
						<button onClick={viewBooksButton} className="square">View Books</button>
					</div>
					<div className="col-md-3">
						<button onClick={() => openModal("lendBook")} className="square">Lend Book</button>
					</div>
					<div className="col-md-3">
						<button onClick={() => openModal("returnBook")} className="square">Return Book</button>
					</div>
				</div>

				{/* Add Member Modal */}
				{showModal && modalType === "addMember" && (
					<div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-lg">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Add Member</h5>
								<button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
							</div>
							<div className="modal-body">
								<input
									type="text"
									className="form-control"
									value={memberInputs.memberName}
									onChange={(e) => setMemberInputs({ memberName: e.target.value })}
									placeholder="Member Name"
								/>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
								<button type="button" className="btn btn-primary" onClick={handleAddMember}>Add Member</button>
							</div>
						</div>
					</div>
          </div>
				)}

				{/* Remove Member Modal */}
				{showModal && modalType === "removeMember" && (
					<div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-lg">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Remove Member</h5>
								<button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
							</div>
							<div className="modal-body">
								<input
									type="text"
									className="form-control"
									value={memberRemovalInputs.memberId}
									onChange={(e) => setMemberRemovalInputs({ memberId: e.target.value })}
									placeholder="Member ID"
								/>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
								<button type="button" className="btn btn-danger" onClick={handleRemoveMember}>Remove Member</button>
							</div>
						</div>
					</div>
          </div>
				)}

				{/* Add Book Modal */}
				{showModal && modalType === "addBook" && (
					<div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-lg">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Add Book</h5>
								<button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
							</div>
							<div className="modal-body">
								<input
									type="text"
									className="form-control"
									value={bookInputs.title}
									onChange={(e) => setBookInputs({ ...bookInputs, title: e.target.value })}
									placeholder="Title"
								/>
								<input
									type="text"
									className="form-control"
									value={bookInputs.author}
									onChange={(e) => setBookInputs({ ...bookInputs, author: e.target.value })}
									placeholder="Author"
								/>
								<input
									type="text"
									className="form-control"
									value={bookInputs.isbn}
									onChange={(e) => setBookInputs({ ...bookInputs, isbn: e.target.value })}
									placeholder="ISBN"
								/>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
								<button type="button" className="btn btn-primary" onClick={handleAddBook}>Add Book</button>
							</div>
						</div>
					</div>
          </div>
				)}

				{/* Remove Book Modal */}
				{showModal && modalType === "removeBook" && (
					<div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-lg">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Remove Book</h5>
								<button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
							</div>
							<div className="modal-body">
								<input
									type="text"
									className="form-control"
									value={bookRemovalInputs.bookId}
									onChange={(e) => setBookRemovalInputs({ ...bookRemovalInputs, bookId: e.target.value })}
									placeholder="Book ID"
								/>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
								<button type="button" className="btn btn-danger" onClick={handleRemoveBook}>Remove Book</button>
							</div>
						</div>
					</div>
          </div>
				)}

				{/* Lend Book Modal */}
				{showModal && modalType === "lendBook" && (
					<div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-lg">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Lend Book</h5>
								<button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
							</div>
							<div className="modal-body">
								<input
									type="text"
									className="form-control"
									value={lendBookInputs.memberId}
									onChange={(e) => setLendBookInputs({ ...lendBookInputs, memberId: e.target.value })}
									placeholder="Member ID"
								/>
								<input
									type="text"
									className="form-control"
									value={lendBookInputs.bookId}
									onChange={(e) => setLendBookInputs({ ...lendBookInputs, bookId: e.target.value })}
									placeholder="Book ID"
								/>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
								<button type="button" className="btn btn-primary" onClick={lendBook}>Lend Book</button>
							</div>
						</div>
					</div>
          </div>
				)}

				{/* Return Book Modal */}
				{showModal && modalType === "returnBook" && (
					<div className="modal show" style={{ display: "block" }}>
            <div className="modal-dialog modal-lg">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title">Return Book</h5>
								<button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
							</div>
							<div className="modal-body">
								<input
									type="text"
									className="form-control"
									value={returnBookInputs.memberId}
									onChange={(e) => setReturnBookInputs({ ...returnBookInputs, memberId: e.target.value })}
									placeholder="Member ID"
								/>
								<input
									type="text"
									className="form-control"
									value={returnBookInputs.bookId}
									onChange={(e) => setReturnBookInputs({ ...returnBookInputs, bookId: e.target.value })}
									placeholder="Book ID"
								/>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
								<button type="button" className="btn btn-primary" onClick={returnBook}>Return Book</button>
							</div>
						</div>
					</div>
          </div>
				)}
			</div>
		</div>
	);
};

export default Library;