<p><?= htmlentities($page['text']) ?></p>

<p>
    <a href="/edit.php?id=<?= $page['id'] ?>">edit</a>
</p>

<?php
    if (!empty($parents)) {
?>
<h2>Parents</h2>

<?php
        foreach ($parents as $relationship) {
?>
<p>
    <a href="/<?= $relationship['id'] ?>">#</a>
    <?= $relationship['text'] ?>
    [<a href="/view.php?id=<?= $page['id'] ?>&del=<?= $relationship['rid'] ?>">x</a>]
</p>
<?php
        }
    }
?>

<?php
    if (!empty($children)) {
?>
<h2>Children</h2>

<?php
        foreach ($children as $relationship) {
?>
<p>
    <a href="/<?= $relationship['id'] ?>">#</a>
    <?= $relationship['text'] ?>
    [<a href="/view.php?id=<?= $page['id'] ?>&del=<?= $relationship['rid'] ?>">x</a>]
</p>
<?php
        }
    }
?>

<?php
    if (!empty($relatedto)) {
?>
<h2>Related</h2>

<?php
        foreach ($relatedto as $relationship) {
?>
<p>
    <a href="/<?= $relationship['id'] ?>">#</a>
    <?= $relationship['text'] ?>
    [<a href="/view.php?id=<?= $page['id'] ?>&del=<?= $relationship['rid'] ?>">x</a>]
</p>
<?php
        }
    }
?>

<h2>Add relationship</h2>

<form method="POST">

<p>
    Type:
    <select name="type">
        <option value="1">Related</option>
        <option value="2">Parent of</option>
        <option value="3">Child of</option>
    </select>
</p>

<p>
    UID:
    <input type="text" name="related" />
</p>

<p>
    <input type="submit" value="Add relationship" /></p>
</p>

</form>

<h2>Add new related</h2>

<form method="POST">

<p>
    Type:
    <select name="type">
        <option value="1">Related</option>
        <option value="2">Parent of</option>
        <option value="3">Child of</option>
    </select>
</p>

<p>
    <textarea name="text" cols="100" rows="10" style="padding: 0.5em;"></textarea>
</p>

<p>
    <input type="submit" value="Add new related" /></p>
</p>

</form>
