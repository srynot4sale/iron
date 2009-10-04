<table>
<tbody>
<?php

    foreach ($pages as $page)
    {
?>
    <tr>
        <td>
        <a href="/<?= $page['data.uid'] ?>">#</a> <?= $page['data.text'] ?> <?= str_repeat('.', $page['links']) ?>
        </td>
    </tr>

<?php
    }
?>
</tbody>
</table>
