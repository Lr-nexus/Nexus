exports.ok = (res, data = {}, message = 'OK') =>
  res.status(200).json({ success: true, message, ...data });

exports.created = (res, data = {}, message = 'Created') =>
  res.status(201).json({ success: true, message, ...data });